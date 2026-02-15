import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [mockOtp, setMockOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    pin: '',
    pin_confirm: '',
    role: 'user',
  });
  const [otpData, setOtpData] = useState({
    contact: '',
    otp: '',
  });
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      toast.error(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }
    
    if (formData.pin !== formData.pin_confirm) {
      toast.error('Pin does not match');
      setErrors({ pin_confirm: 'Pin does not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      toast.success(response.data.message);
      setMockOtp(response.data.mock_otp);
      setOtpData({ contact: formData.email, otp: '' });
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/auth/verify-otp`, otpData);
      toast.success('Account verified successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center" data-testid="register-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{step === 1 ? t('register') : 'Verify OTP'}</CardTitle>
              <CardDescription>
                {step === 1 ? 'Create your account' : 'Enter the OTP sent to your email and phone'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="role">{t('userType')}</Label>
                    <RadioGroup value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="user" id="user" data-testid="role-user" />
                          <Label htmlFor="user" className="font-normal">{t('user')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="provider" id="provider" data-testid="role-provider" />
                          <Label htmlFor="provider" className="font-normal">{t('provider')}</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="name">{t('name')}</Label>
                    <Input
                      id="name"
                      data-testid="name-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      data-testid="email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      data-testid="phone-input"
                      type="tel"
                      placeholder="+919876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      data-testid="password-input"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength="6"
                    />
                  </div>

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

                  <div>
                    <Label htmlFor="pin_confirm">Re-enter {t('pin')}</Label>
                    <Input
                      id="pin_confirm"
                      data-testid="pin-confirm-input"
                      type="password"
                      maxLength="4"
                      value={formData.pin_confirm}
                      onChange={(e) => setFormData({ ...formData, pin_confirm: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="register-submit-btn">
                    {loading ? 'Registering...' : t('register')}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {mockOtp && (
                    <div className="p-4 bg-accent/20 rounded-md border border-accent">
                      <p className="text-sm font-semibold">Mock OTP: {mockOtp}</p>
                      <p className="text-xs text-muted-foreground mt-1">Use this OTP for testing</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                      <Input
                        id="otp"
                        data-testid="otp-input"
                        type="text"
                        maxLength="6"
                        value={otpData.otp}
                        onChange={(e) => setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="verify-otp-btn">
                      {loading ? 'Verifying...' : t('verifyOtp')}
                    </Button>
                  </form>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline" data-testid="login-link">
                    {t('login')}
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

export default RegisterPage;
