
import React, { useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { normalizeWardName } from '../utils/normalization';

interface WardStat {
    _id: string; // Ward name
    amount: number;
    quantity: number;
    count: number;
}

const LeaderboardGenerator: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [wardStats, setWardStats] = useState<WardStat[]>([]);
    const [stats, setStats] = useState<{ totalQuantity: number }>({ totalQuantity: 0 });

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
                headers: { 'Authorization': token || '' }
            });
            const data = await res.json();

            // Process ward stats
            const normalizedWardStats: Record<string, WardStat> = {};
            if (data.wardStats) {
                data.wardStats.forEach((stat: any) => {
                    const normalized = normalizeWardName(stat._id);
                    if (!normalizedWardStats[normalized]) {
                        normalizedWardStats[normalized] = { _id: normalized, amount: 0, quantity: 0, count: 0 };
                    }
                    normalizedWardStats[normalized].amount += stat.amount;
                    normalizedWardStats[normalized].quantity += stat.quantity;
                    normalizedWardStats[normalized].count += stat.count;
                });
            }

            const sortedWards = Object.values(normalizedWardStats).sort((a, b) => b.quantity - a.quantity);
            setWardStats(sortedWards);
            setStats({ totalQuantity: data.overall.totalQuantity });

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const generateImage = async (download = false) => {
        setIsGenerating(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Dimensions as per requirement
            canvas.width = 2048;
            canvas.height = 2560;

            img.src = '/leaderboard.jpeg';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            if (ctx) {
                ctx.drawImage(img, 0, 0, 2048, 2560);

                // Common Text Settings
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const purpleColor = '#6c308b'; // Assuming purple theme based on previous context
                const redColor = '#ffffffff'; // Example for date/time if needed or just use purple

                // --- Date & Time ---
                const now = new Date();
                const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. Sunday
                const dateNum = now.getDate().toString();
                const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                // Date Number: 267,188,214,123 -> Center ~240, 155
                ctx.fillStyle = purpleColor;
                ctx.font = 'bold 50px Arial';
                ctx.fillText(dateNum, 240, 155);

                // Day Name: 64,207,341,244 -> Center ~202, 225
                ctx.font = 'bold 40px Arial';
                ctx.fillText(dayName.toUpperCase(), 202, 225);

                // Time: 115,255,299,300 -> Center ~207, 277
                ctx.font = 'bold 35px Arial';
                ctx.fillText(timeStr, 207, 277);


                // --- Top 3 Units ---
                const top1 = wardStats[0];
                const top2 = wardStats[1];
                const top3 = wardStats[2];

                // 1st Place Name: 854,950,1513,1055 -> Center ~1183, 1002
                if (top1) {
                    ctx.font = 'bold 80px Arial';
                    ctx.fillStyle = purpleColor;
                    ctx.fillText(top1._id.toUpperCase(), 1183, 1002);

                    // 1st Place Count: 1703,948,1787,1042 -> Center ~1745, 995
                    ctx.font = 'bold 80px Arial';
                    ctx.fillStyle = redColor;
                    ctx.fillText(top1.quantity.toString(), 1745, 995);
                }

                // 2nd Place Name: 866,1210,1517,1324 -> Center ~1191, 1267
                if (top2) {
                    ctx.font = 'bold 80px Arial';
                    ctx.fillStyle = purpleColor;
                    ctx.fillText(top2._id.toUpperCase(), 1191, 1267);

                    // 2nd Place Count: 1702,1218,1790,1311 -> Center ~1746, 1264
                    ctx.font = 'bold 80px Arial';
                    ctx.fillStyle = redColor;
                    ctx.fillText(top2.quantity.toString(), 1746, 1264);
                }

                // 3rd Place Name: 876,1486,1519,1587 -> Center ~1197, 1536
                if (top3) {
                    ctx.font = 'bold 80px Arial';
                    ctx.fillStyle = purpleColor;
                    ctx.fillText(top3._id.toUpperCase(), 1197, 1536);

                    // 3rd Place Count: 1700,1476,1785,1578 -> Center ~1742, 1527
                    ctx.font = 'bold 80px Arial';
                    ctx.fillStyle = redColor;
                    ctx.fillText(top3.quantity.toString(), 1742, 1527);
                }

                // --- Total Packs Count ---
                // 1237,1688,1475,1771 -> Center ~1356, 1729
                ctx.font = 'bold 90px Arial';
                ctx.fillStyle = '#ffffff';
                // Let's assume the user wants it visible.
                ctx.fillStyle = purpleColor;
                ctx.fillText(stats.totalQuantity.toString(), 1356, 1729);


                if (download) {
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const link = document.createElement('a');
                    link.download = `leaderboard-${new Date().toISOString().split('T')[0]}.jpg`;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        } catch (error) {
            console.error('Error generating leaderboard:', error);
            alert('Failed to generate leaderboard.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white border border-brand-purple/10 p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Leaderboard Generator</h2>
                    <p className="text-gray-500 text-sm">Generate daily status poster</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchStats}
                        className="p-2 text-gray-500 hover:text-brand-purple transition-colors"
                        title="Refresh Stats"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => generateImage(true)}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 brand-gradient text-white rounded-lg hover:opacity-90 transition-all font-bold text-sm disabled:opacity-70"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Download Poster
                    </button>
                </div>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
                <h3 className="font-bold text-gray-700">Current Data</h3>
                <div className="space-y-4">
                    <div className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-600 font-medium">Total Packs</span>
                        <span className="font-mono font-bold text-brand-purple text-lg">{stats.totalQuantity}</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-500">Top 3 Units (Poster Content)</p>
                        {wardStats.slice(0, 3).map((ward, i) => (
                            <div key={i} className="flex justify-between p-3 rounded-lg border border-gray-100 text-sm bg-white shadow-sm">
                                <span className="font-medium text-gray-900">#{i + 1} {ward._id}</span>
                                <span className="text-brand-blue font-bold">{ward.quantity} packs</span>
                            </div>
                        ))}
                        {wardStats.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No data available yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardGenerator;
