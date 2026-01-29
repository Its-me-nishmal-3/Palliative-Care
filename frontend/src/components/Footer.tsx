

import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

const Footer = () => {
    return (
        <footer className="brand-gradient text-white py-12 mt-12 shadow-2xl">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

                    <div className="flex flex-col items-center md:items-start gap-4">
                        <img src={logo} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-brand-lavender/20 shadow-lg" />
                        <div>
                            <h3 className="text-white text-lg font-bold mb-2">Thachanattukara Palliative Care Society</h3>
                            <p className="text-sm mb-2 text-brand-lavender/80">
                                Empowering the community with quality products and services.
                            </p>
                            <div className="text-sm text-brand-lavender/60">
                                <p>Email: dev.nishmal@gmail.com</p>
                                <p>Phone: +91 9544472307</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-brand-lavender/80">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Policies</h3>
                        <ul className="space-y-2 text-sm text-brand-lavender/80">
                            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
                            <li><Link to="/cancellation-refund" className="hover:text-white transition-colors">Cancellation & Refund</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/10 mt-8 pt-8 text-center text-xs text-brand-lavender/60">
                    <p>&copy; {new Date().getFullYear()} Thachanattukara Palliative Care Society. All rights reserved.</p>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
