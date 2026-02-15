import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, Clock, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingStatus = () => {
  const { bookingId } = useParams();
  const { t } = useLanguage();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`${API}/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      toast.error('Booking not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6" />;
      case 'in_progress':
        return <Package className="h-6 w-6" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6" />;
      default:
        return <Clock className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="booking-status-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8">{t('trackBooking')}</h1>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">Loading booking details...</CardContent>
            </Card>
          ) : booking ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking #{booking.booking_id.slice(0, 8)}</CardTitle>
                  <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'} data-testid="booking-status-badge">
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-md">
                  {getStatusIcon(booking.status)}
                  <div>
                    <h3 className="font-semibold">Status: {booking.status}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.status === 'pending' && 'Your booking is pending confirmation'}
                      {booking.status === 'in_progress' && 'Service is currently in progress'}
                      {booking.status === 'completed' && 'Service has been completed'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Service Details</h3>
                  <div className="border-l-4 border-primary pl-4 space-y-1">
                    <p><strong>Service:</strong> {booking.service?.name}</p>
                    <p><strong>Hours/Days:</strong> {booking.hours_days}</p>
                    <p><strong>Total Amount:</strong> ₹{booking.total_amount}</p>
                    <p><strong>Payment Method:</strong> {booking.payment_method}</p>
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-muted-foreground">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Booking not found
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BookingStatus;