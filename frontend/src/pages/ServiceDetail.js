import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Star, ShoppingCart, Phone, Mail } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(1);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`${API}/services/${serviceId}`);
      setService(response.data);
    } catch (error) {
      toast.error('Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    if (user.role !== 'user') {
      toast.error('Only users can add to cart');
      return;
    }

    try {
      await axios.post(`${API}/cart`, {
        service_id: serviceId,
        hours_days: hours,
      });
      toast.success('Service added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Service not found</p>
        </div>
      </div>
    );
  }

  const finalPrice = service.base_price * (1 - service.discount / 100);
  const totalPrice = finalPrice * hours;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="service-detail-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{service.name}</CardTitle>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-sm">Google Rating</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{t('description')}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Pricing</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-bold">₹{service.base_price} / {service.unit}</span>
                    </div>
                    {service.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-bold">{service.discount}% OFF</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg">
                      <span>Final Price:</span>
                      <span className="font-bold text-primary">₹{finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Provider Information</h4>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {service.provider?.name}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${service.provider?.phone}`} className="text-primary hover:underline">
                        {service.provider?.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${service.provider?.email}`} className="text-primary hover:underline">
                        {service.provider?.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {user && user.role === 'user' && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Book This Service</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hours">Hours/Days Required</Label>
                      <Input
                        id="hours"
                        data-testid="hours-input"
                        type="number"
                        min="1"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {user && user.role === 'user' && (
              <CardFooter className="flex gap-4">
                <Button onClick={handleAddToCart} className="flex-1 gap-2" data-testid="add-to-cart-btn">
                  <ShoppingCart className="h-4 w-4" /> {t('addToCart')}
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceDetail;