import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('password');
  const [formData, setFormData] = useState({
    email_or_phone: '',
    password: '',
    pin: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email_or_phone: formData.email_or_phone,
        password: loginType === 'password' ? formData.password : undefined,
        pin: loginType === 'pin' ? formData.pin : undefined,
        login_type: loginType,
      });

      login(response.data.token, response.data.user);
      toast.success(response.data.message);
      navigate(`/${response.data.user.role}-dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center" data-testid="login-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('login')}</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={loginType} onValueChange={setLoginType} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password" data-testid="password-tab">Password</TabsTrigger>
                  <TabsTrigger value="pin" data-testid="pin-tab">PIN</TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email_or_phone">{t('email')} / {t('phone')}</Label>
                  <Input
                    id="email_or_phone"
                    data-testid="email-or-phone-input"
                    type="text"
                    value={formData.email_or_phone}
                    onChange={(e) => setFormData({ ...formData, email_or_phone: e.target.value })}
                    required
                  />
                </div>

                {loginType === 'password' ? (
                  <div>
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      data-testid="password-input"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="pin">4-Digit {t('pin')}</Label>
                    <Input
                      id="pin"
                      data-testid="pin-input"
                      type="password"
                      maxLength="4"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>
                )}

                <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="login-submit-btn">
                  {loading ? 'Logging in...' : t('login')}
                </Button>
              </form>

              <div className="mt-6 space-y-2 text-center">
                <Link to="/change-pin" className="text-sm text-primary hover:underline block" data-testid="forgot-pin-link">
                  {t('forgotPin')}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
                    {t('register')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;