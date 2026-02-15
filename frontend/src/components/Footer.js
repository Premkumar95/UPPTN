import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-20" data-testid="footer">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-2xl text-primary">ServiceHub TN</h3>
            <p className="text-slate-400 text-sm">
              Your trusted marketplace for finding verified service providers across TamilNadu.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="h-4 w-4 text-primary" />
              <span>TamilNadu, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Register as Provider
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-white">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services?category=Earth Movers" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Earth Movers
                </Link>
              </li>
              <li>
                <Link to="/services?category=Packers and Movers" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Packers & Movers
                </Link>
              </li>
              <li>
                <Link to="/services?category=Bore Well" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Bore Well
                </Link>
              </li>
              <li>
                <Link to="/services?category=Power Tools" className="text-slate-400 hover:text-primary transition-colors text-sm">
                  Power Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-white">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@servicehuBtn.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 ServiceHub TN. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-testid="social-facebook"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-slate-300" />
              </a>
              
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-secondary flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-testid="social-twitter"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-slate-300" />
              </a>
              
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-testid="social-instagram"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-slate-300" />
              </a>
              
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-testid="social-linkedin"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-slate-300" />
              </a>
              
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                data-testid="social-youtube"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5 text-slate-300" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
