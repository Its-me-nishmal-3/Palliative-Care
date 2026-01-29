import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentModalProps {
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [ward, setWard] = useState('SELECT YOUR UNIT');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePayment = async () => {
        if (!name) return alert('Please enter your name');
        if (!mobile || mobile.length < 10) return alert('Please enter a valid mobile number');
        if (ward === 'SELECT YOUR UNIT') return alert('Please select your unit');
        setLoading(true);

        try {
            // 1. Create Order (Federal Bank flow)
            const res = await fetch('https://palliative-care.onrender.com/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity, name, mobile, ward })
            });
            const data = await res.json();

            // Check if backend is in "No-Payment Mode"
            if (data.paymentMode === false) {
                onClose();
                navigate('/receipt', { state: { payment: data.payment } });
                return;
            }

            if (data.payment_url) {
                // 2. Redirect to Federal Bank Payment Page
                window.location.href = data.payment_url;
            } else {
                alert('Failed to initiate payment. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong initiating the payment');
            setLoading(false);
        }
    };

    const incrementQty = () => setQuantity(q => q + 1);
    const decrementQty = () => setQuantity(q => q > 1 ? q - 1 : 1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-brand-purple/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-brand-purple">
                    Make Payment
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Mobile Number</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setMobile(val);
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all"
                            placeholder="Enter 10-digit mobile number"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Select Unit</label>
                        <select
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                        >
                            <option value="SELECT YOUR UNIT" disabled>
                                SELECT YOUR UNIT
                            </option>

                            {[
                                'കുണ്ടൂർകുന്ന്', 'കൂത്തുപറമ്പ്', 'കിഴക്കുംപുറം', 'ചോളോട്', 'നറുക്കോട്',
                                'കൂരിമുക്ക്', 'മുറിയങ്കണ്ണി', 'കാമ്പ്രം', 'പൂവ്വത്താണി', 'വെള്ളക്കുന്ന്',
                                'കരിങ്കല്ലത്താണി', 'തൊടൂകാപ്പ്', 'തള്ളച്ചിറ', 'മണലുംപുറം', '53 ാം മൈൽ',
                                'പാറപ്പുറം', 'നാട്ടുക്കൽ', 'അണ്ണാൻതൊടി', 'പുതുമനക്കുളമ്പ്', 'പഴഞ്ചീരി',
                                'പാലോട്', 'പാറമ്മൽ', 'കുന്നുംപുറം', 'കൊടക്കാട്', 'Other'
                            ].map((u, i) => (
                                <option key={i} value={u}>
                                    {u}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* Quantity Selector */}
                    <div>
                        <label className="block text-gray-700 mb-2 text-sm font-medium">Number of Packs</label>
                        <div className="flex items-center gap-4 bg-brand-lavender/50 p-2 rounded-xl border border-brand-purple/20 w-fit">
                            <button
                                onClick={decrementQty}
                                className="p-2 hover:bg-brand-lavender rounded-lg transition-colors text-gray-700"
                            >
                                <Minus size={20} />
                            </button>
                            <span className="text-xl font-bold w-8 text-center text-gray-900">{quantity}</span>
                            <button
                                onClick={incrementQty}
                                className="p-2 hover:bg-brand-lavender rounded-lg transition-colors text-gray-700"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                            <span>Total Amount ({quantity} x ₹500)</span>
                            <span className="text-xl font-bold text-gray-900">₹{500 * quantity}</span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-brand-purple hover:bg-brand-deep-violet text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Processing...' : `Pay ₹${500 * quantity}`}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
