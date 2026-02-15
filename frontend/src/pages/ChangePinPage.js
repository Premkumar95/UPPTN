import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChangePinPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [mockOtp, setMockOtp] = useState('');
  const [formData, setFormData] = useState({
    email_or_phone: '',
    otp: '',
    new_pin: '',
    confirm_pin: '',
  });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/request-change-pin`, {
        contact: formData.email_or_phone,
      });
      toast.success(response.data.message);
      setMockOtp(response.data.mock_otp);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    
    if (formData.new_pin !== formData.confirm_pin) {
      toast.error('Pin does not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/change-pin`, formData);
      toast.success('PIN changed successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center" data-testid="change-pin-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('changePin')}</CardTitle>
              <CardDescription>
                {step === 1 ? 'Enter your email or phone number' : 'Enter OTP and new PIN'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
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

                  <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="request-otp-btn">
                    {loading ? 'Sending...' : t('sendOtp')}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {mockOtp && (
                    <div className="p-4 bg-accent/20 rounded-md border border-accent">
                      <p className="text-sm font-semibold">Mock OTP: {mockOtp}</p>
                    </div>
                  )}

                  <form onSubmit={handleChangePin} className="space-y-4">
                    <div>
                      <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                      <Input
                        id="otp"
                        data-testid="otp-input"
                        type="text"
                        maxLength="6"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="new_pin">New 4-Digit {t('pin')}</Label>
                      <Input
                        id="new_pin"
                        data-testid="new-pin-input"
                        type="password"
                        maxLength="4"
                        value={formData.new_pin}
                        onChange={(e) => setFormData({ ...formData, new_pin: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm_pin">Confirm {t('pin')}</Label>
                      <Input
                        id="confirm_pin"
                        data-testid="confirm-pin-input"
                        type="password"
                        maxLength="4"
                        value={formData.confirm_pin}
                        onChange={(e) => setFormData({ ...formData, confirm_pin: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full btn-primary" disabled={loading} data-testid="change-pin-btn">
                      {loading ? 'Changing...' : t('changePin')}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ChangePinPage;