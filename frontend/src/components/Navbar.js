import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80" data-testid="navbar">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="logo-link">
            ServiceHub TN
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <Link to="/services" data-testid="services-link">
                <Button variant="ghost" className="font-semibold text-slate-200 hover:text-primary hover:bg-slate-800">
                  {t('services')}
                </Button>
              </Link>
            )}

            {user && user.role === 'user' && (
              <Link to="/cart" data-testid="cart-link">
                <Button variant="ghost" className="font-semibold text-slate-200 hover:text-primary hover:bg-slate-800">
                  {t('cart')}
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-200 hover:text-primary hover:bg-slate-800" data-testid="language-toggle">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem onClick={toggleLanguage} className="text-slate-200 hover:text-primary" data-testid="language-en">
                  English {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleLanguage} className="text-slate-200 hover:text-primary" data-testid="language-ta">
                  தமிழ் {language === 'ta' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <Button onClick={logout} variant="destructive" className="gap-2" data-testid="logout-button">
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" data-testid="login-link">
                  <Button variant="outline" className="font-semibold border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-primary">{t('login')}</Button>
                </Link>
                <Link to="/register" data-testid="register-link">
                  <Button className="btn-primary font-bold">{t('register')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};