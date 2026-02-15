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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="navbar">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="font-extrabold text-2xl tracking-tighter text-primary" data-testid="logo-link">
            ServiceHub TN
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <Link to="/services" data-testid="services-link">
                <Button variant="ghost" className="font-semibold">
                  {t('services')}
                </Button>
              </Link>
            )}

            {user && user.role === 'user' && (
              <Link to="/cart" data-testid="cart-link">
                <Button variant="ghost" className="font-semibold">
                  {t('cart')}
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="language-toggle">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleLanguage} data-testid="language-en">
                  English {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleLanguage} data-testid="language-ta">
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
              <Link to="/login" data-testid="login-link">
                <Button className="btn-primary">{t('login')}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};