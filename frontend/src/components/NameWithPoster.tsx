import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Loader2, Share2 } from 'lucide-react';

const NameWithPoster: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [_quantity, setQuantity] = useState(1);
    const [amount, setAmount] = useState(0);
    const [generated, setGenerated] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const nameParam = searchParams.get('name');
    const quantityParam = searchParams.get('quantity');
    const amountParam = searchParams.get('amount');
    const typeParam = searchParams.get('type');

    useEffect(() => {
        if (nameParam) {
            setName(nameParam);
            setQuantity(quantityParam ? parseInt(quantityParam) : 1);
            setAmount(amountParam ? parseInt(amountParam) : 500);
            setGenerated(true);

            // If type=image, generate and return image only
            if (typeParam === 'image') {
                generateImageOnly(nameParam, quantityParam ? parseInt(quantityParam) : 1, amountParam ? parseInt(amountParam) : 500);
            }
        }
    }, [nameParam, quantityParam, amountParam, typeParam]);

    const generateImageOnly = async (userName: string, _qty: number, amt: number) => {
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
                ctx.drawImage(img, 0, 0, 4500, 5625);
                // ctx.fillStyle = '#751d08';
                ctx.textBaseline = 'middle';

                // Area 1: Name - coords (620,1644,2876,1846)
                const nameX = 620;
                const nameY = 1644 + ((1846 - 1644) / 2);
                ctx.font = 'bold 120px Arial, sans-serif';
                ctx.fillStyle = '#6c308b';
                ctx.textAlign = 'left';
                ctx.fillText(userName.toUpperCase(), nameX, nameY);

                // Area 2: Amount - coords (2371,4401,3857,4644)
                const amtX = 2371;
                const amtY = 4401 + ((4644 - 4401) / 2);
                ctx.font = 'bold 100px Arial, sans-serif';
                ctx.fillStyle = '#6c308b';
                ctx.textAlign = 'left';
                ctx.fillText(`₹${amt}`, amtX, amtY);

                // Quantity hidden

                // Convert to blob and replace document
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        window.location.href = url;
                    }
                }, 'image/jpeg', 0.9);
            }
        } catch (error) {
            console.error('Error generating image:', error);
        }
    };

    const handleGenerate = () => {
        if (name.trim()) {
            setGenerated(true);
        }
    };

    const handleDownload = async () => {
        setIsProcessing(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Original dimensions (new image size)
            canvas.width = 1937;
            canvas.height = 2560;
            img.src = '/recipt.jpeg';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            if (ctx) {
                ctx.drawImage(img, 0, 0, 4500, 5625);
                ctx.textBaseline = 'middle';

                // Area 1: Name - coords (620,1644,2876,1846)
                const nameX = 620;
                const nameY = 1644 + ((1846 - 1644) / 2);
                ctx.font = 'bold 120px Arial, sans-serif';
                ctx.fillStyle = '#6c308b';
                ctx.textAlign = 'left';
                ctx.fillText(name.toUpperCase(), nameX, nameY);

                // Area 2: Amount - coords (2371,4401,3857,4644)
                const amtX = 2371;
                const amtY = 4401 + ((4644 - 4401) / 2);
                ctx.font = 'bold 100px Arial, sans-serif';
                ctx.fillStyle = '#6c308b';
                ctx.textAlign = 'left';
                ctx.fillText(`₹${amount}`, amtX, amtY);

                // Quantity hidden

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const link = document.createElement('a');
                link.download = `poster-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error generating poster:', error);
            alert('Failed to generate poster. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleShare = async () => {
        setIsProcessing(true);
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Original dimensions (new image size)
            canvas.width = 1937;
            canvas.height = 2560;
            img.src = '/recipt.jpeg';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            if (ctx) {
                ctx.drawImage(img, 0, 0, 4500, 5625);
                ctx.textBaseline = 'middle';

                // Area 1: Name - coords (620,1644,2876,1846)
                const nameX = 620;
                const nameY = 1644 + ((1846 - 1644) / 2);
                ctx.font = 'bold 120px Arial, sans-serif';
                ctx.fillStyle = '#6c308b';
                ctx.textAlign = 'left';
                ctx.fillText(name.toUpperCase(), nameX, nameY);

                // Area 2: Amount - coords (2371,4401,3857,4644)
                const amtX = 2371;
                const amtY = 4401 + ((4644 - 4401) / 2);
                ctx.font = 'bold 100px Arial, sans-serif';
                ctx.fillStyle = '#6c308b';
                ctx.textAlign = 'left';
                ctx.fillText(`₹${amount}`, amtX, amtY);

                // Quantity hidden

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], `poster-${name.replace(/\s+/g, '-').toLowerCase()}.jpg`, { type: 'image/jpeg' });

                if (navigator.share) {
                    await navigator.share({
                        files: [file],
                        title: 'Thachanattukara Palliative Care Society Poster',
                        text: `Poster for ${name}`
                    });
                } else {
                    alert("Sharing is not supported on this device.");
                }
            }
        } catch (error) {
            console.error('Error sharing poster:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Return nothing if type=image (image generation happens in useEffect)
    if (typeParam === 'image') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
            {!generated ? (
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        Generate Your Poster
                    </h1>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Your Name
                            </label>
                            <input
                                id="name-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="e.g., John Doe"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none text-gray-800"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!name.trim()}
                            className="w-full brand-gradient hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            Generate Poster
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative w-full max-w-lg shadow-2xl rounded-lg overflow-hidden">
                        <div className="relative w-full">
                            <img
                                src="/recipt.jpeg"
                                alt="Poster"
                                className="w-full h-auto block"
                            />

                            {/* Area 1: Name - coords="620,1644,2876,1846" */}
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
                                    {name}
                                </span>
                            </div>

                            {/* Area 2: Amount - coords="2371,4401,3857,4644" */}
                            <div
                                className="absolute flex items-center overflow-hidden"
                                style={{
                                    left: '52.69%',
                                    top: '78.24%',
                                    width: '33.02%',
                                    height: '4.32%',
                                    color: '#6c308b',
                                }}
                            >
                                <span className="font-bold text-[2.5vw] sm:text-[1.8vw] md:text-xs lg:text-base text-left leading-none">
                                    ₹{amount}
                                </span>
                            </div>

                            {/* Quantity Hidden */}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4 w-full max-w-xs justify-center">
                        <button
                            onClick={handleDownload}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 brand-gradient text-white rounded-xl hover:opacity-90 transition-all shadow-lg font-bold active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    <Download size={20} /> Download
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 brand-gradient text-white rounded-xl hover:opacity-90 transition-all shadow-lg font-bold active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />} Share
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setGenerated(false);
                            setName('');
                        }}
                        className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        Generate Another
                    </button>
                </>
            )}
        </div>
    );
};

export default NameWithPoster;
