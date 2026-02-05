import React, {
    useEffect,
    useLayoutEffect,
    useState
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

interface PaymentRecord {
    _id?: string;
    name: string;
    ward: string;
    amount: number;
    paymentId: string;
    createdAt: string;
    local?: boolean;
}

const History: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const unitFilter = searchParams.get('unit');

    const [history, setHistory] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchHistory = async (pageNum: number, isLoadMore = false) => {
        try {
            if (isLoadMore) setIsFetchingMore(true);

            const url = unitFilter
                ? `${API_BASE_URL}/api/payment/history?page=${pageNum}&limit=10&ward=${encodeURIComponent(unitFilter)}`
                : `${API_BASE_URL}/api/payment/history?page=${pageNum}&limit=10`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.payments) {
                setHistory(prev =>
                    isLoadMore ? [...prev, ...data.payments] : data.payments
                );
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    // 🔹 Reset + stay at TOP when unit filter changes or on mount
    useLayoutEffect(() => {
        // Immediate scroll
        window.scrollTo(0, 0);

        // Timeout to override browser scroll restoration
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);

        setHistory([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);

        fetchHistory(1);

        return () => clearTimeout(timer);
    }, [unitFilter]);

    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop <
            document.documentElement.offsetHeight - 100 ||
            isFetchingMore ||
            !hasMore
        ) {
            return;
        }

        setPage(prev => {
            const nextPage = prev + 1;
            fetchHistory(nextPage, true);
            return nextPage;
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isFetchingMore]);

    return (
        <div className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto pb-24">
            {/* HEADER */}
            {/* HEADER */}
            <div className="relative mb-8 pt-4">
                {unitFilter ? (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl overflow-hidden relative"
                    >
                        {/* Decorative background blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

                        <div className="relative z-10">
                            <button
                                onClick={() => navigate('/')}
                                className="mb-6 flex items-center gap-2 text-brand-blue hover:text-brand-purple transition-colors font-medium text-sm group"
                            >
                                <div className="bg-brand-blue/10 p-2 rounded-full group-hover:bg-brand-purple/10 transition-colors">
                                    <ChevronLeft size={16} />
                                </div>
                                Back to Dashboard
                            </button>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 brand-gradient rounded-full" />
                                        <h2 className="text-brand-purple text-xs md:text-sm font-bold uppercase tracking-wider">Unit Dashboard</h2>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                                        {unitFilter}
                                    </h1>
                                    <p className="text-gray-500 text-sm md:text-base">
                                        Showing all payment records for this unit
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSearchParams({})}
                                    className="self-start md:self-end px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow-md"
                                >
                                    <X size={16} />
                                    View All Units
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <header className="flex items-center gap-4 bg-white border border-brand-purple/10 p-4 rounded-2xl shadow-lg">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-full hover:bg-brand-lavender transition-colors text-brand-purple"
                        >
                            <ChevronLeft />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Payment History
                            </h1>
                        </div>
                    </header>
                )}
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="text-center text-gray-500 bg-white border border-brand-purple/10 p-6 rounded-2xl">
                    Loading...
                </div>
            ) : (
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center text-gray-500 bg-white border border-brand-purple/10 p-6 rounded-2xl">
                            No payments found
                        </div>
                    ) : (
                        <>
                            {history.map((item, i) => (
                                <motion.div
                                    key={item._id || i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-white border border-brand-purple/10 p-4 rounded-2xl flex justify-between items-center shadow-lg hover:shadow-xl transition-all"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-800">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {item.ward} •{' '}
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono mt-1">
                                            {item.paymentId}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-brand-blue font-bold text-lg">
                                            ₹{item.amount}
                                        </p>
                                        <button
                                            onClick={() =>
                                                navigate('/receipt', {
                                                    state: { payment: item },
                                                })
                                            }
                                            className="text-xs text-brand-teal hover:text-brand-purple mt-1 font-medium"
                                        >
                                            View Receipt
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {isFetchingMore && (
                                <div className="text-center text-gray-500 py-4 bg-white/60 rounded-xl">
                                    Loading more...
                                </div>
                            )}

                            {!hasMore && history.length > 0 && (
                                <div className="text-center text-gray-500 py-4 text-sm bg-white/60 rounded-xl">
                                    No more payments to load
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default History;
