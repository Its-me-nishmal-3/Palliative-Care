
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, TrendingUp, Users, Package, DollarSign, Clock, Filter, ArrowUpDown, Download } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { normalizeWardName, transliterateWard } from '../utils/normalization';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SOCKET_URL = API_BASE_URL;

interface Payment {
    _id: string;
    name: string;
    ward: string;
    mobile: string;
    amount: number;
    quantity: number;
    paymentId: string;
    createdAt: string;
    status: string;
}

interface Analytics {
    overall: {
        totalAmount: number;
        totalQuantity: number;
        totalOrders: number;
        avgOrderValue: number;
    };
    wardStats: { _id: string; amount: number; quantity: number; count: number }[];
    dailyStats: { _id: string; amount: number; quantity: number; count: number }[];
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'analytics' | 'payments'>('analytics');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [search, setSearch] = useState('');
    const [wardFilter, setWardFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const navigate = useNavigate();

    const fetchPayments = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return navigate('/login');

        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (wardFilter !== 'All') params.append('ward', wardFilter);

            const res = await fetch(`${API_BASE_URL}/api/admin/payments?${params.toString()}`, {
                headers: { 'Authorization': token }
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('adminToken');
                return navigate('/login');
            }

            const data: Payment[] = await res.json();
            // Normalize ward names in payment list
            const normalizedPayments = data.map(payment => ({
                ...payment,
                ward: normalizeWardName(payment.ward)
            }));
            setPayments(normalizedPayments);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const fetchAnalytics = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return navigate('/login');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
                headers: { 'Authorization': token }
            });
            const data: Analytics = await res.json();

            // Normalize wardStats to consolidate "നാട്ടുക്കൽ" and "നാട്ടുകൽ"
            const normalizedWardStats: Record<string, { amount: number; quantity: number; count: number }> = {};
            if (data.wardStats) {
                data.wardStats.forEach(stat => {
                    const normalized = normalizeWardName(stat._id);
                    if (!normalizedWardStats[normalized]) {
                        normalizedWardStats[normalized] = { amount: 0, quantity: 0, count: 0 };
                    }
                    normalizedWardStats[normalized].amount += stat.amount;
                    normalizedWardStats[normalized].quantity += stat.quantity;
                    normalizedWardStats[normalized].count += stat.count;
                });
            }

            setAnalytics({
                ...data,
                wardStats: Object.entries(normalizedWardStats).map(([id, stats]) => ({
                    _id: id,
                    ...stats
                }))
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    useEffect(() => {
        fetchAnalytics();

        const socket = io(SOCKET_URL);
        socket.on('connect', () => console.log('Admin Socket Connected'));
        socket.on('payment_success', () => {
            console.log('Payment Success. Refreshing...');
            fetchAnalytics();
            fetchPayments();
        });
        socket.on('payment_created', () => {
            console.log('New Payment Created. Refreshing...');
            fetchPayments();
        });
        socket.on('payment_failed', () => {
            console.log('Payment Failed. Refreshing...');
            fetchPayments();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'payments') {
            const debounce = setTimeout(() => {
                fetchPayments();
            }, 300);
            return () => clearTimeout(debounce);
        }
    }, [search, wardFilter, activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const getFilteredAndSortedPayments = () => {
        let filtered = [...payments];

        // 1. Status Filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        // 2. Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'amount-high':
                    return b.amount - a.amount;
                case 'amount-low':
                    return a.amount - b.amount;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return filtered;
    };

    const exportToExcel = () => {
        const filtered = getFilteredAndSortedPayments();
        const data = filtered.map(p => {
            const date = new Date(p.createdAt);
            return {
                'Date': date.toLocaleDateString(),
                'Time': date.toLocaleTimeString(),
                'Name': p.name,
                'Mobile': p.mobile,
                'Unit': transliterateWard(p.ward),
                'Qty': p.quantity,
                'Amount': p.amount,
                'Status': p.status || 'success',
                'Payment ID': p.paymentId
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, `payments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = () => {
        const filtered = getFilteredAndSortedPayments();
        const doc = new jsPDF() as any;

        doc.text("Payment History Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        const tableColumn = ["Date", "Name", "Mobile", "Unit", "Qty", "Amt", "Status"];
        const tableRows = filtered.map(p => [
            new Date(p.createdAt).toLocaleDateString(),
            p.name,
            p.mobile,
            transliterateWard(p.ward),
            p.quantity,
            p.amount,
            p.status || 'success'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [48, 82, 161] }
        });

        doc.save(`payments_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const displayPayments = getFilteredAndSortedPayments();

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen pb-24 space-y-8 bg-white text-gray-900">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-blue">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm">Overview & Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white p-1 rounded-lg border border-brand-purple/20">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-md text-sm transition-colors ${activeTab === 'analytics' ? 'brand-gradient text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-4 py-2 rounded-md text-sm transition-colors ${activeTab === 'payments' ? 'brand-gradient text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Payments
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="glass-button text-sm py-2 px-4 bg-red-600 hover:bg-red-500 flex items-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            {activeTab === 'analytics' && analytics && (
                <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-brand-purple/10 p-6 flex flex-col items-center text-center rounded-2xl shadow-lg">
                            <div className="p-3 bg-brand-purple/10 rounded-full mb-2">
                                <DollarSign className="text-brand-purple" size={24} />
                            </div>
                            <h3 className="text-gray-500 text-xs uppercase tracking-wider">Total Revenue</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">₹{analytics.overall.totalAmount.toLocaleString()}</p>
                        </div>

                        <div className="bg-white border border-brand-purple/10 p-6 flex flex-col items-center text-center rounded-2xl shadow-lg">
                            <div className="p-3 bg-brand-teal/10 rounded-full mb-2">
                                <Package className="text-brand-teal" size={24} />
                            </div>
                            <h3 className="text-gray-500 text-xs uppercase tracking-wider">Total Packs</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.overall.totalQuantity}</p>
                        </div>

                        <div className="bg-white border border-brand-purple/10 p-6 flex flex-col items-center text-center rounded-2xl shadow-lg">
                            <div className="p-3 bg-brand-purple/10 rounded-full mb-2">
                                <Users className="text-brand-purple" size={24} />
                            </div>
                            <h3 className="text-gray-500 text-xs uppercase tracking-wider">Total Orders</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.overall.totalOrders}</p>
                        </div>

                        <div className="bg-white border border-brand-purple/10 p-6 flex flex-col items-center text-center rounded-2xl shadow-lg">
                            <div className="p-3 bg-yellow-500/10 rounded-full mb-2">
                                <TrendingUp className="text-yellow-600" size={24} />
                            </div>
                            <h3 className="text-gray-500 text-xs uppercase tracking-wider">Avg Order Value</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">₹{Math.round(analytics.overall.avgOrderValue || 0)}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Ward Performance */}
                        <div className="bg-white border border-brand-purple/10 p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-bold mb-6">Unit Performance</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.wardStats} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                                        <YAxis dataKey="_id" type="category" stroke="#64748b" fontSize={12} width={60} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b' }}
                                            itemStyle={{ color: '#1e293b' }}
                                            formatter={(value?: number) => [`₹${(value || 0).toLocaleString()}`, 'Revenue']}
                                        />
                                        <Bar dataKey="amount" fill="#3052a1" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Daily Trend */}
                        <div className="bg-white/90 backdrop-blur-xl border border-sky-100 p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-bold mb-6">Daily Growth (Last 7 Days)</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.dailyStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="_id" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b' }}
                                            itemStyle={{ color: '#1e293b' }}
                                            formatter={(value?: number) => [`₹${(value || 0).toLocaleString()}`, 'Revenue']}
                                        />
                                        <Line type="monotone" dataKey="amount" stroke="#6c308b" strokeWidth={3} dot={{ fill: '#6c308b' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payments' && (
                <div className="animate-in fade-in zoom-in duration-300">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search Name, Phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 bg-white text-gray-900 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-400 shrink-0" size={18} />
                            <select
                                value={wardFilter}
                                onChange={(e) => setWardFilter(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 bg-white text-gray-900 text-sm"
                            >
                                <option value="All">All Units</option>
                                {[
                                    'കുണ്ടൂർകുന്ന്', 'കൂത്തുപറമ്പ്', 'കിഴക്കുംപുറം', 'ചോളോട്', 'നറുക്കോട്',
                                    'കൂരിമുക്ക്', 'മുറിയങ്കണ്ണി', 'കാമ്പ്രം', 'പൂവ്വത്താണി', 'വെള്ളക്കുന്ന്',
                                    'കരിങ്കല്ലത്താണി', 'തൊടൂകാപ്പ്', 'തള്ളച്ചിറ', 'മണലുംപുറം', '53 ാം മൈൽ',
                                    'പാറപ്പുറം', 'നാട്ടുകൽ', 'അണ്ണാൻതൊടി', 'പുതുമനക്കുളമ്പ്', 'പഴഞ്ചീരി',
                                    'പാലോട്', 'പാറമ്മൽ', 'കുന്നുംപുറം', 'കൊടക്കാട്', 'Other'
                                ].map((ward, i) => (
                                    <option key={i} value={ward}>{ward}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="text-gray-400 shrink-0" size={18} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 bg-white text-gray-900 text-sm"
                            >
                                <option value="All">All Status</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="created">Created</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="text-gray-400 shrink-0" size={18} />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 bg-white text-gray-900 text-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                                <option value="name-asc">Name: A to Z</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mb-4">
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Download size={16} /> Export Excel
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Download size={16} /> Export PDF
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-brand-purple/10 rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Mobile</th>
                                        <th className="p-4">Unit</th>
                                        <th className="p-4">Qty</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 hidden md:table-cell">Payment ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-gray-500">No payments found</td>
                                        </tr>
                                    ) : (
                                        displayPayments.map((p) => {
                                            const createdAt = new Date(p.createdAt);
                                            return (
                                                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="text-sm font-medium text-gray-900">{createdAt.toLocaleDateString()}</div>
                                                        <div className="text-xs text-gray-500">{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td className="p-4 font-semibold text-gray-900">{p.name}</td>
                                                    <td className="p-4 text-gray-600 font-mono text-sm">{p.mobile}</td>
                                                    <td className="p-4 text-gray-600 text-sm">{p.ward}</td>
                                                    <td className="p-4 text-gray-600 text-sm">{p.quantity}</td>
                                                    <td className="p-4 text-brand-blue font-bold">₹{p.amount}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'success'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : p.status === 'failed'
                                                                ? 'bg-red-100 text-red-700'
                                                                : p.status === 'created'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {p.status || 'Success'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-xs text-gray-400 font-mono hidden md:table-cell">{p.paymentId || 'N/A'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
