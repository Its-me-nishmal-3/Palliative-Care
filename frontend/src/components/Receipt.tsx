import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Loader2, Share2 } from 'lucide-react';

const Receipt: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!state?.payment) {
            navigate('/');
        }
    }, [state, navigate]);

    if (!state?.payment) return null;

    const { payment } = state;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Original dimensions (new image size)
            canvas.width = 4500;
            canvas.height = 5625;

            img.src = '/recipt.jpeg';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            if (ctx) {
                // Draw background
                ctx.drawImage(img, 0, 0, 4500, 5625);

                // Configure text
                ctx.textBaseline = 'middle';

                // Area 1: Name - coords (620,1644,2876,1846)
                const nameX = 620;
                const nameY = 1644 + ((1846 - 1644) / 2); // Center vertically
                ctx.font = 'bold 120px Arial, sans-serif';
                ctx.textAlign = 'left';
                ctx.fillStyle = '#6c308b';
                ctx.fillText(payment.name.toUpperCase(), nameX, nameY);

                // Area 2: Amount - coords (2371,4401,3857,4644)
                const amtX = 2371 + ((3857 - 2371) / 2); // Center horizontally
                const amtY = 4401 + ((4644 - 4401) / 2); // Center vertically
                ctx.font = 'bold 160px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#6c308b';
                ctx.fillText(`₹${payment.amount || (payment.quantity * 500)}/-`, amtX, amtY);

                // Quantity hidden

                // Watermark
                const now = new Date();
                const watermark = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
                ctx.font = 'italic 30px Arial, sans-serif';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.textAlign = 'center';
                ctx.fillText(watermark, canvas.width / 2, canvas.height - 50);

                // Trigger download
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const link = document.createElement('a');
                link.download = `receipt - ${payment.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error generating receipt:', error);
            alert('Failed to generate receipt image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
            <div className="relative w-full max-w-lg shadow-2xl rounded-lg overflow-hidden">
                {/* Display Container */}
                <div className="relative w-full">
                    <img
                        src="/recipt.jpeg"
                        alt="Receipt"
                        className="w-full h-auto block"
                        useMap="#receipt-map"
                    />

                    {/* Area 1: Name - coords="620,1644,2876,1846"
                        Width: 4500, Height: 5625
                        Left: 620/4500 = 13.78%
                        Top: 1644/5625 = 29.23%
                        Width: (2876-620)/4500 = 50.13%
                        Height: (1846-1644)/5625 = 3.59%
                     */}
                    <div
                        className="absolute flex items-center overflow-hidden"
                        style={{
                            left: '13.78%',
                            top: '29.23%',
                            width: '50.13%',
                            height: '3.59%',
                            color: '#6c308b',
                        }}
                    >
                        <span className="font-bold text-[3vw] sm:text-[2vw] md:text-sm lg:text-lg uppercase tracking-wide truncate w-full text-left leading-none">
                            {payment.name}
                        </span>
                    </div>

                    {/* Area 2: Amount - coords="2371,4401,3857,4644"
                        Left: 2371/4500 = 52.69%
                        Top: 4401/5625 = 78.24%
                        Width: (3857-2371)/4500 = 33.02%
                        Height: (4644-4401)/5625 = 4.32%
                     */}
                    <div
                        className="absolute flex items-center justify-center overflow-hidden"
                        style={{
                            left: '52.69%',
                            top: '78.24%',
                            width: '33.02%',
                            height: '4.32%',
                            color: '#6c308b',
                        }}
                    >
                        <span className="font-bold text-[4vw] sm:text-[3vw] md:text-xl lg:text-2xl text-center leading-none">
                            ₹{payment.amount || (payment.quantity * 500)}/-
                        </span>
                    </div>

                    {/* Quantity Hidden as per new requirement */}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full max-w-lg justify-center px-4">
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 brand-gradient text-white rounded-xl hover:opacity-90 transition-all shadow-md font-bold text-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <>
                            <Download size={16} /> Download
                        </>
                    )}
                </button>
                <button
                    onClick={async () => {
                        setIsDownloading(true);
                        try {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const img = new Image();
                            canvas.width = 4500;
                            canvas.height = 5625;
                            img.src = '/recipt.jpeg';
                            await new Promise((resolve, reject) => {
                                img.onload = resolve;
                                img.onerror = reject;
                            });
                            if (ctx) {
                                ctx.drawImage(img, 0, 0, 4500, 5625);
                                ctx.fillStyle = '#6c308b';
                                ctx.textBaseline = 'middle';

                                // Area 1: Name - coords="620,1644,2876,1846"
                                // Center Y: 1644 + (1846-1644)/2 = 1745
                                const nameX = 620;
                                const nameY = 1745;
                                ctx.font = 'bold 120px Arial, sans-serif';
                                ctx.textAlign = 'left';
                                ctx.fillStyle = '#6c308b';
                                ctx.fillText(payment.name.toUpperCase(), nameX, nameY);


                                // Area 2: Amount - coords="2371,4401,3857,4644"
                                // Center X: 2371 + (3857-2371)/2 = 3114
                                // Center Y: 4401 + (4644-4401)/2 = 4522.5
                                const amtX = 3114;
                                const amtY = 4522.5;
                                ctx.font = 'bold 160px Arial, sans-serif';
                                ctx.textAlign = 'center';
                                ctx.fillStyle = '#6c308b';
                                ctx.fillText(`₹${payment.amount || (payment.quantity * 500)}/-`, amtX, amtY);

                                // Watermark
                                const now = new Date();
                                const watermark = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
                                ctx.font = 'italic 30px Arial, sans-serif';
                                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                                ctx.textAlign = 'center';
                                ctx.fillText(watermark, canvas.width / 2, canvas.height - 50);

                                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                                const blob = await (await fetch(dataUrl)).blob();
                                const file = new File([blob], `receipt-${payment.name.replace(/\s+/g, '-').toLowerCase()}.jpg`, { type: 'image/jpeg' });

                                if (navigator.share) {
                                    await navigator.share({
                                        files: [file],
                                        title: 'Thachanattukara Palliative Care Society Receipt',
                                        text: `Payment Receipt for ${payment.name}`
                                    });
                                } else {
                                    alert("Sharing is not supported on this device.");
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setIsDownloading(false);
                        }
                    }}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 brand-gradient text-white rounded-xl hover:opacity-90 transition-all shadow-md font-bold text-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />} Share
                </button>
                <button
                    onClick={() => navigate('/gen-poster')}
                    className="flex-1 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                    Poster
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm shadow-sm"
                >
                    Home
                </button>
            </div>
        </div>
    );
};

export default Receipt;
