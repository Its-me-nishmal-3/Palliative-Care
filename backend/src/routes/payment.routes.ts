import express from 'express';
import crypto from 'crypto';
import Payment from '../models/Payment';
import { io } from '../server';
import { paymentLimiter, statsLimiter } from '../middleware/rateLimiter';
import { FederalBankUtils } from '../utils/federal_bank.utils';

const router = express.Router();

// FB_CONFIG removed to allow dynamic access in routes


// Helper function to send WhatsApp notification asynchronously
const sendWhatsAppNotification = async (name: string, quantity: number, amount: number, mobile: string) => {
    try {
        const url = new URL('https://wa-otp-palliative-care.onrender.com/send-dates');
        url.searchParams.append('name', name);
        url.searchParams.append('quantity', quantity.toString());
        url.searchParams.append('amount', amount.toString());
        url.searchParams.append('mobile', `91${mobile}`);
        url.searchParams.append('caption', `Dates Challenge-ൽ പങ്കാളിയായതിന് നന്ദി! 🙏✨`);

        const response = await fetch(url.toString());
        if (!response.ok) {
            console.warn(`WhatsApp notification failed: ${response.status} ${response.statusText}`);
        } else {
            console.log(`WhatsApp notification sent successfully to ${mobile}`);
        }
    } catch (error) {
        console.warn('Failed to send WhatsApp notification:', error);
    }
};

// Create Order (rate limited)
router.post('/create-order', paymentLimiter, async (req, res) => {
    try {
        const { quantity = 1, name, mobile, ward } = req.body;
        // Check for test amount in env, otherwise use default calculation
        const amount = process.env.TEST_AMOUNT ? parseFloat(process.env.TEST_AMOUNT) : (500 * quantity);

        const FB_CONFIG = {
            api_url: process.env.FB_API_URL || 'https://pgbiz.Omniware.in',
            api_key: process.env.FB_API_KEY,
            salt: process.env.FB_SALT,
            return_url: process.env.FB_RETURN_URL || 'https://palliative-care.onrender.com/api/payment/verify',
        };

        // Check if PAYMENT_MODE is disabled in .env
        const isNoPaymentMode = process.env.PAYMENT_MODE === 'false';

        if (isNoPaymentMode) {
            // Bypass Payment: Create a successful record immediately
            const payment = new Payment({
                name,
                ward,
                amount,
                quantity,
                mobile,
                paymentId: `no_pay_${Date.now()}`,
                orderId: `no_order_${Date.now()}`,
                status: 'success'
            });
            await payment.save();

            // Emit Socket Update for real-time dashboard updates
            io.emit('payment_success', {
                amount: payment.amount,
                ward: ward,
                quantity: quantity,
                payment
            });

            // Send WhatsApp notification asynchronously
            setImmediate(() => {
                sendWhatsAppNotification(name, quantity, amount, mobile).catch(err => {
                    console.warn('WhatsApp notification error (No-Payment Mode):', err);
                });
            });

            return res.json({
                paymentMode: false,
                status: 'success',
                payment
            });
        }

        if (!FB_CONFIG.api_key || !FB_CONFIG.salt) {
            console.error('Federal Bank configuration missing');
            return res.status(500).json({ error: 'Payment gateway configuration error' });
        }

        const orderId = `ORD_${Date.now()}`;

        // Prepare parameters for hash calculation
        const params: Record<string, any> = {
            api_key: FB_CONFIG.api_key,
            order_id: orderId,
            mode: 'LIVE', // or 'TEST'
            amount: amount.toFixed(2),
            currency: 'INR',
            description: 'Palliative Care Dates Challenge',
            name: name,
            email: 'care@palliative.com', // Placeholder if not provided
            phone: mobile,
            city: ward, // Using ward as city
            country: 'IND',
            zip_code: '679335', // Placeholder
            return_url: FB_CONFIG.return_url
        };

        const hash = FederalBankUtils.generateHash(params, FB_CONFIG.salt!);
        params.hash = hash;

        // Two Step Integration: Get Payment Request URL
        const fbResponse = await fetch(`${FB_CONFIG.api_url}/v2/getpaymentrequesturl`, {
            method: 'POST',
            body: new URLSearchParams(params)
        });

        const responseText = await fbResponse.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse Federal Bank response as JSON:', responseText);
            return res.status(500).json({ error: 'Invalid response from payment gateway' });
        }

        if (data.data && data.data.url) {
            // Save initial "Created" state
            const payment = new Payment({
                name,
                ward,
                amount,
                quantity,
                mobile,
                paymentId: 'pending',
                orderId: orderId,
                status: 'created'
            });
            await payment.save();

            // Emit Socket Update for Admin
            io.emit('payment_created', {
                amount: payment.amount,
                ward: ward,
                payment
            });

            res.json({
                paymentMode: true,
                payment_url: data.data.url,
                orderId: orderId
            });
        } else {
            console.error('Federal Bank API error:', data);
            res.status(500).json({ error: 'Failed to initiate payment with Federal Bank' });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Error creating order');
    }
});

// Verify Payment / Return URL handling
router.post('/verify', async (req, res) => {
    try {
        console.log('--- Verify Endpoint Hit ---');
        console.log('Request Body:', req.body);
        console.log('Request Query:', req.query);

        const responseData = req.body;
        const { order_id, transaction_id, response_code, response_message } = responseData;

        const FB_CONFIG = {
            api_url: process.env.FB_API_URL || 'https://pgbiz.Omniware.in',
            api_key: process.env.FB_API_KEY,
            salt: process.env.FB_SALT,
            return_url: process.env.FB_RETURN_URL || 'https://palliative-care.onrender.com/api/payment/verify',
        };

        const isValidHash = FederalBankUtils.verifyHash(responseData, FB_CONFIG.salt!);

        if (!isValidHash) {
            console.warn('Invalid hash received from Federal Bank');
            return res.status(400).send('Invalid signature');
        }

        const payment = await Payment.findOne({ orderId: order_id });

        if (!payment) {
            console.warn(`Payment record not found for order: ${order_id}`);
            return res.status(404).send('Payment not found');
        }

        if (response_code === '0' || response_code === 0) {
            // Success
            payment.paymentId = transaction_id;
            payment.status = 'success';
            payment.webhookProcessed = true;
            await payment.save();

            // Emit Socket Update
            io.emit('payment_success', {
                amount: payment.amount,
                ward: payment.ward,
                quantity: payment.quantity,
                payment
            });

            // Send WhatsApp notification asynchronously
            setImmediate(() => {
                sendWhatsAppNotification(
                    payment.name,
                    payment.quantity,
                    payment.amount,
                    payment.mobile
                ).catch(err => {
                    console.warn('WhatsApp notification error (async):', err);
                });
            });

            // Redirect user to receipt page on frontend
            const frontendUrl = process.env.FRONTEND_URL || 'https://palliative-care-dates.web.app';
            res.redirect(`${frontendUrl}/receipt?orderId=${order_id}`);
        } else {
            // Failure
            payment.status = 'failed';
            payment.paymentId = transaction_id || 'failed';
            await payment.save();

            io.emit('payment_failed', { payment });

            const frontendUrl = process.env.FRONTEND_URL || 'https://palliative-care-dates.web.app';
            res.redirect(`${frontendUrl}/dashboard?error=${encodeURIComponent(response_message)}`);
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Official Federal Bank Webhook/Callback Endpoint
router.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        const { order_id, transaction_id, response_code } = payload;

        const FB_CONFIG = {
            api_url: process.env.FB_API_URL || 'https://pgbiz.Omniware.in',
            api_key: process.env.FB_API_KEY,
            salt: process.env.FB_SALT,
            return_url: process.env.FB_RETURN_URL || 'https://palliative-care.onrender.com/api/payment/verify',
        };

        const isValidHash = FederalBankUtils.verifyHash(payload, FB_CONFIG.salt!);
        if (!isValidHash) {
            console.warn('Invalid webhook hash received');
            return res.status(400).json({ status: 'invalid_hash' });
        }

        const payment = await Payment.findOne({ orderId: order_id });

        if (!payment || payment.webhookProcessed) {
            return res.status(200).json({ status: 'ignored' });
        }

        if (response_code === '0' || response_code === 0) {
            payment.paymentId = transaction_id;
            payment.status = 'success';
            payment.webhookProcessed = true;
            await payment.save();

            io.emit('payment_success', {
                amount: payment.amount,
                ward: payment.ward,
                quantity: payment.quantity,
                payment
            });

            setImmediate(() => {
                sendWhatsAppNotification(payment.name, payment.quantity, payment.amount, payment.mobile);
            });
        }

        res.status(200).json({ status: 'processed' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).json({ status: 'error' });
    }
});

// Get Todays Toppers (rate limited)
router.get('/todays-toppers', statsLimiter, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const toppers = await Payment.aggregate([
            {
                $match: {
                    status: 'success',
                    createdAt: { $gte: startOfDay }
                }
            },
            {
                $group: {
                    _id: '$mobile',
                    name: { $first: '$name' },
                    ward: { $first: '$ward' },
                    totalQuantity: { $sum: '$quantity' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        res.json(toppers);
    } catch (error) {
        console.error('Error fetching todays toppers:', error);
        res.status(500).json({ message: 'Error fetching toppers' });
    }
});

// Get Stats (rate limited to prevent scraping)
router.get('/stats', statsLimiter, async (req, res) => {
    try {
        const totalAmount = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalCount = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);

        const wardStats = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: '$ward', total: { $sum: '$quantity' } } }
        ]);

        const wardWise: Record<string, number> = {};
        wardStats.forEach(stat => {
            wardWise[stat._id] = stat.total;
        });

        res.json({
            totalAmount: totalAmount[0]?.total || 0,
            totalCount: totalCount[0]?.total || 0,
            wardWise
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Get History (Paginated, rate limited)
router.get('/history', statsLimiter, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const ward = req.query.ward as string | undefined;
        const skip = (page - 1) * limit;

        const filter: any = { status: 'success' };
        if (ward) {
            filter.ward = ward;
        }

        const total = await Payment.countDocuments(filter);

        const payments = await Payment.find(filter)
            .select('name ward amount quantity paymentId createdAt status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            payments,
            hasMore: skip + payments.length < total,
            total
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error fetching history' });
    }
});

export default router;
