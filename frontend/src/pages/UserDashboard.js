import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingBag, Package, Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="user-dashboard">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{t('welcome')}, {user?.name}!</h1>
              <p className="text-muted-foreground">Manage your bookings and services</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to="/services" data-testid="quick-action-browse">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="bg-primary/10 p-3 rounded-sm">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Browse Services</h3>
                    <p className="text-sm text-muted-foreground">Find what you need</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/cart" data-testid="quick-action-cart">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="bg-blue-100 p-3 rounded-sm">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">My Cart</h3>
                    <p className="text-sm text-muted-foreground">View cart items</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/profile" data-testid="quick-action-profile">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="bg-green-100 p-3 rounded-sm">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Profile</h3>
                    <p className="text-sm text-muted-foreground">Manage your account</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings yet. Start by browsing services!</p>
                  <Link to="/services">
                    <Button className="mt-4" data-testid="browse-services-btn">Browse Services</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <div
                      key={booking.booking_id}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                      data-testid={`booking-${index}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{booking.service?.name}</h3>
                          <p className="text-sm text-muted-foreground">Booking ID: {booking.booking_id.slice(0, 8)}</p>
                        </div>
                        <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-semibold">₹{booking.total_amount}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-semibold">{booking.hours_days} hours</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Provider:</span>
                          <p className="font-semibold">{booking.provider?.name}</p>
                        </div>
                        <div>
                          <Link to={`/track/${booking.booking_id}`}>
                            <Button size="sm" variant="outline" data-testid={`track-booking-${index}`}>
                              Track
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;