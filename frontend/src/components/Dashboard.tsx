import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import PaymentModal from './PaymentModal';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Trophy, Crown } from 'lucide-react';

// Assets
import logo from '../assets/logo.jpeg';
import mainImage from '../assets/main__ .jpeg';
import banner1 from '../assets/WhatsApp Image 2026-01-23 at 12.11.02 AM.jpeg';
import banner2 from '../assets/WhatsApp Image 2026-01-23 at 12.11.03 AM (1).jpeg';
import banner3 from '../assets/WhatsApp Image 2026-01-23 at 12.11.03 AM (2).jpeg';
import banner4 from '../assets/WhatsApp Image 2026-01-23 at 12.11.03 AM.jpeg';
import banner5 from '../assets/WhatsApp Image 2026-01-23 at 12.11.04 AM (1).jpeg';
import banner6 from '../assets/WhatsApp Image 2026-01-23 at 12.11.04 AM.jpeg';
import banner7 from '../assets/WhatsApp Image 2026-01-23 at 12.11.05 AM.jpeg';
import banner8 from '../assets/WhatsApp Image 2026-01-23 at 12.11.06 AM.jpeg';

const SOCKET_URL = 'https://socketurl.onrender.com';

const UNIT_NAMES = [
    'കുണ്ടൂർകുന്ന്', 'കൂത്തുപറമ്പ്', 'കിഴക്കുംപുറം', 'ചോളോട്', 'നറുക്കോട്',
    'കൂരിമുക്ക്', 'മുറിയങ്കണ്ണി', 'കാമ്പ്രം', 'പൂവ്വത്താണി', 'വെള്ളക്കുന്ന്',
    'കരിങ്കല്ലത്താണി', 'തൊടൂകാപ്പ്', 'തള്ളച്ചിറ', 'മണലുംപുറം', '53 ാം മൈൽ',
    'പാറപ്പുറം', 'നാട്ടുക്കൽ', 'അണ്ണാൻതൊടി', 'പുതുമനക്കുളമ്പ്', 'പഴഞ്ചീരി',
    'പാലോട്', 'പാറമ്മൽ', 'കുന്നുംപുറം', 'കൊടക്കാട്', 'Other'
];

const BANNERS = [banner1, banner2, banner3, banner4, banner5, banner6, banner7, banner8];

interface Stats {
    totalAmount: number;
    totalCount: number;
    wardWise: Record<string, number>;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState<Stats>({ totalAmount: 0, totalCount: 0, wardWise: {} });
    const [todaysToppers, setTodaysToppers] = useState<{ _id: string; name: string; ward: string; totalQuantity: number; totalAmount: number }[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [isWelcomeExpanded, setIsWelcomeExpanded] = useState(() => {
        const saved = localStorage.getItem('welcomeExpanded');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleWelcome = () => {
        const newValue = !isWelcomeExpanded;
        setIsWelcomeExpanded(newValue);
        localStorage.setItem('welcomeExpanded', JSON.stringify(newValue));
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${SOCKET_URL}/api/payment/stats`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchToppers = async () => {
        try {
            const res = await fetch('https://socketurl.onrender.com/api/payment/todays-toppers');
            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                setTodaysToppers(data);
            } else {
                // Dummy data for testing/fallback
                // setTodaysToppers([
                //     { _id: '1', name: 'Muhammed Nihal', ward: 'Tiruvegapura', totalQuantity: 10, totalAmount: 5000 },
                //     { _id: '2', name: 'Adil K', ward: 'Muthuthala', totalQuantity: 8, totalAmount: 4000 },
                //     { _id: '3', name: 'Sahal P', ward: 'Vilathur', totalQuantity: 5, totalAmount: 2500 }
                // ]);
            }
        } catch (error) {
            console.error('Error fetching toppers, using dummy data:', error);
            setTodaysToppers([
                { _id: '1', name: 'Muhammed Nihal', ward: 'Tiruvegapura', totalQuantity: 10, totalAmount: 5000 },
                { _id: '2', name: 'Adil K', ward: 'Muthuthala', totalQuantity: 8, totalAmount: 4000 },
                { _id: '3', name: 'Sahal P', ward: 'Vilathur', totalQuantity: 5, totalAmount: 2500 }
            ]);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchToppers();

        const socket = io(SOCKET_URL);
        socket.on('connect', () => console.log('Connected to socket'));
        socket.on('payment_success', (data: any) => {
            console.log('Payment success event:', data);
            fetchStats();
            fetchToppers();
        });
        socket.on('payment_created', () => {
            fetchStats();
            fetchToppers();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Auto-change carousel every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % BANNERS.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-brand-lavender text-gray-900 font-sans selection:bg-brand-purple/20 pb-24 relative overflow-hidden">

            {/* Enhanced Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-purple/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-deep-violet/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-brand-lavender/50 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 space-y-8 pt-8">
                {/* Header */}
                <header className="flex justify-between items-center backdrop-blur-xl bg-white/80 p-3 md:p-4 rounded-2xl border border-brand-purple/10 sticky top-4 z-50 shadow-xl">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-md border border-brand-purple/10" />
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-brand-purple drop-shadow-sm leading-tight">
                                Thachanattukara Palliative Care Society
                            </h1>
                            <p className="text-gray-600 text-[10px] md:text-xs font-medium uppercase tracking-wider">DATES CHALLENGE</p>
                        </div>
                    </div>
                    <div className="flex gap-3 md:gap-4 items-center">
                        <button
                            onClick={() => navigate('/install-app')}
                            className="flex flex-col items-center group"
                            title="Install App"
                        >
                            <span className="text-xs text-brand-purple font-semibold mb-0.5 group-hover:text-brand-deep-violet transition-colors">Use as App</span>
                            <div className="bg-brand-lavender p-1.5 rounded-lg hover:bg-brand-purple/10 transition-all border border-brand-purple/20 group-hover:scale-110 group-hover:border-brand-purple/40">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-purple group-hover:text-brand-deep-violet"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/history')}
                            className="px-4 py-2 bg-brand-lavender hover:bg-brand-purple/10 rounded-lg text-sm transition-all border border-brand-purple/20 hover:border-brand-purple/40 h-10 text-brand-purple font-medium"
                        >
                            History
                        </button>
                    </div>
                </header>

                {/* Main Stats - TOP PRIORITY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white border border-brand-purple/10 p-6 md:p-8 rounded-2xl relative overflow-hidden group hover:shadow-2xl hover:shadow-brand-purple/10 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <IndianRupee className="w-20 h-20 text-brand-purple" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-brand-purple text-xs md:text-sm uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></span>
                                Total Collected
                            </h3>
                            <p className="text-5xl md:text-6xl font-extrabold text-brand-deep-violet drop-shadow-sm">
                                ₹{stats.totalAmount.toLocaleString()}
                            </p>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-brand-purple animate-pulse" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white border border-brand-teal/20 p-6 md:p-8 rounded-2xl relative overflow-hidden group hover:shadow-2xl hover:shadow-brand-teal/10 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-20 h-20 text-brand-teal" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-brand-teal text-xs md:text-sm uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></span>
                                Total Packs
                            </h3>
                            <p className="text-5xl md:text-6xl font-extrabold text-brand-deep-violet drop-shadow-sm">
                                {stats.totalCount}
                            </p>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-brand-teal animate-pulse" />
                    </motion.div>
                </div>

                {/* Today's Toppers Section */}
                {todaysToppers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl mx-auto mb-12"
                    >
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-brand-purple/10 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-100 rounded-lg border border-yellow-200">
                                    <Trophy className="text-yellow-600 w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-brand-deep-violet">Today's Toppers</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {todaysToppers.map((topper, index) => (
                                    <div key={topper._id} className="relative bg-white rounded-xl p-4 border border-sky-50 hover:border-sky-200 hover:shadow-lg transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-sm
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-sky-50 text-sky-600 border border-sky-100'}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-brand-deep-violet text-sm">{topper.name}</h3>
                                                <p className="text-xs text-gray-500">{topper.ward}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs font-bold text-brand-purple">{topper.totalQuantity} Packs</span>
                                                    <span className="text-xs font-bold text-gray-400">|</span>
                                                    <span className="text-xs font-bold text-brand-teal">₹{topper.totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {index === 0 && (
                                            <Crown className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 rotate-12" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">

                    {/* Welcome Card */}
                    <div className="xl:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white border border-brand-purple/10 rounded-3xl p-6 md:p-8 overflow-hidden relative shadow-xl h-full"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-purple/5 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-teal/5 blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold text-brand-deep-violet font-malayalam leading-tight flex items-center gap-3">
                                        <span className="w-1.5 h-10 bg-brand-purple rounded-full"></span>
                                        പ്രിയമുള്ളവരെ…
                                    </h2>
                                    <button
                                        onClick={toggleWelcome}
                                        className="p-2 rounded-lg bg-brand-lavender/50 hover:bg-brand-lavender border border-brand-purple/20 hover:border-brand-purple/40 transition-all group"
                                        title={isWelcomeExpanded ? "Hide Message" : "Show Message"}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`text-brand-purple transition-transform duration-300 ${isWelcomeExpanded ? 'rotate-180' : ''}`}
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {isWelcomeExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg font-malayalam">
                                                <p className="hover:text-gray-900 transition-colors">
                                                    നമ്മുടെ നാട്ടിലെ സാമൂഹിക സാംസ്‌കാരിക സേവന രംഗത്ത് സജീവമായി പ്രവർത്തിക്കുന്ന സംഘടനയാണ് തച്ച നാട്ടുകര പാലിയേറ്റീവ് കെയർ സൊസൈറ്റി.
                                                </p>
                                                <p className="hover:text-gray-600 transition-colors">
                                                    പൊതുജനങ്ങളുടെ ആരോഗ്യ സംരക്ഷണത്തിനും പുരോഗതിക്കും മാതൃകപരമായ ഇടപെടലുകൾ നടത്തി തച്ച നാട്ടുകര പാലിയേറ്റീവ് കെയർ സൊസൈറ്റി അതിന്റെ പ്രയാണം നടത്തികൊണ്ടിരിക്കുകയാണ്.
                                                </p>
                                                <p className="font-semibold text-brand-purple hover:text-brand-deep-violet transition-colors bg-brand-lavender/50 border-l-4 border-brand-purple pl-4 py-2 rounded-r-lg">
                                                    തുടർന്നും ഇത്തരം പ്രവർത്തനങ്ങൾക്കും പ്രയത്നങ്ങൾക്കും ശക്തി പകരാൻ പാലിയേറ്റീവ് കെയർ സൊസൈറ്റിയുടെ "Dates Challenge" -ൽ പങ്കാളികളാവണമെന്ന് വിനീതമായി അഭ്യർത്ഥിക്കുന്നു
                                                </p>

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Image */}
                    <div className="xl:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative w-full rounded-3xl overflow-hidden shadow-xl border-4 border-sky-100 group h-full min-h-[400px]"
                        >
                            <img
                                src={mainImage}
                                alt="Main Program"
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>
                    </div>

                </div>

                {/* Auto-Changing Carousel */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 pl-2 border-l-4 border-sky-600">Gallery</h3>
                    <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-sky-100 group">
                        {/* Carousel Images */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentBannerIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                                className="absolute inset-0"
                            >
                                <img
                                    src={BANNERS[currentBannerIndex]}
                                    alt={`Banner ${currentBannerIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                            onClick={() => setCurrentBannerIndex((prevIndex) => (prevIndex - 1 + BANNERS.length) % BANNERS.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                            aria-label="Previous image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button
                            onClick={() => setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % BANNERS.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                            aria-label="Next image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {BANNERS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentBannerIndex(index)}
                                    className={`transition-all ${index === currentBannerIndex
                                        ? 'w-8 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                                        } rounded-full`}
                                    aria-label={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Image Counter */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {currentBannerIndex + 1} / {BANNERS.length}
                        </div>
                    </div>
                </div>

                {/* Live Unit Stats - Professional Design */}
                <div className="bg-white border border-brand-purple/10 rounded-3xl p-6 md:p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-brand-purple rounded-full" />
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-deep-violet">
                            Unit Wise Collection
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {UNIT_NAMES
                            .map(unitName => ({
                                name: unitName,
                                amount: stats.wardWise[unitName] || 0
                            }))
                            .sort((a, b) => b.amount - a.amount)
                            .map((ward, index) => {
                                const isActive = ward.amount > 0;
                                const isFirst = index === 0 && isActive;
                                const isSecond = index === 1 && isActive;
                                const isThird = index === 2 && isActive;

                                // Clean, minimal color scheme
                                const getBorderColor = () => {
                                    if (isFirst) return 'border-l-4 border-yellow-400';
                                    if (isSecond) return 'border-l-4 border-brand-purple';
                                    if (isThird) return 'border-l-4 border-brand-teal';
                                    if (isActive) return 'border-l-4 border-brand-purple/40';
                                    return 'border-l-4 border-gray-200';
                                };

                                const getBgColor = () => {
                                    if (isFirst) return 'bg-yellow-50';
                                    if (isSecond) return 'bg-brand-lavender';
                                    if (isThird) return 'bg-brand-teal/5';
                                    if (isActive) return 'bg-brand-lavender/30';
                                    return 'bg-white';
                                };

                                const getRankBadge = () => {
                                    if (isFirst) return { text: '#1', color: 'bg-yellow-400 text-gray-900' };
                                    if (isSecond) return { text: '#2', color: 'bg-brand-purple text-white' };
                                    if (isThird) return { text: '#3', color: 'bg-brand-teal text-white' };
                                    return null;
                                };

                                const getAmountColor = () => {
                                    if (isFirst) return 'text-yellow-600';
                                    if (isSecond) return 'text-brand-purple';
                                    if (isThird) return 'text-brand-teal';
                                    if (isActive) return 'text-brand-purple';
                                    return 'text-gray-400';
                                };

                                const rankBadge = getRankBadge();

                                return (
                                    <motion.div
                                        key={ward.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03, duration: 0.3 }}
                                        onClick={() => ward.amount > 0 && navigate(`/history?unit=${encodeURIComponent(ward.name)}`)}
                                        className={`relative p-5 rounded-lg border ${getBorderColor()} ${getBgColor()} ${ward.amount > 0 ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : 'opacity-50'} transition-all duration-200`}
                                        title={ward.amount > 0 ? `Click to view ${ward.name} payments` : undefined}
                                    >
                                        {/* Rank Badge */}
                                        {rankBadge && (
                                            <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${rankBadge.color}`}>
                                                {rankBadge.text}
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div>
                                            <p className="text-gray-600 text-xs uppercase tracking-wider mb-3 font-semibold">
                                                {ward.name}
                                            </p>
                                            <p className={`text-3xl font-bold ${getAmountColor()}`}>
                                                {ward.amount}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">packs</p>
                                        </div>


                                    </motion.div>
                                );
                            })}
                    </div>
                </div>

                {/* Floating Pay Button */}
                <div className="fixed bottom-8 left-0 w-full flex justify-center px-4 z-40 pointer-events-none">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        className="pointer-events-auto bg-brand-purple text-white font-bold text-lg md:text-xl py-4 px-12 rounded-full shadow-2xl shadow-brand-purple/40 hover:shadow-brand-purple/60 border border-brand-purple/30 backdrop-blur-sm flex items-center gap-2"
                    >
                        Participate
                    </motion.button>
                </div>

                {/* Footer Spacer */}
                <div className="h-24" />
            </div>

            <AnimatePresence>
                {showModal && <PaymentModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
