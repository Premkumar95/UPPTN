import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    base_price: '',
    unit: 'hour',
    discount: 0,
  });

  useEffect(() => {
    fetchServices();
    fetchBookings();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/providers/services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/providers/services`, {
        ...formData,
        base_price: parseFloat(formData.base_price),
        discount: parseFloat(formData.discount),
      });
      toast.success('Service added successfully');
      setDialogOpen(false);
      setFormData({ name: '', category: '', description: '', base_price: '', unit: 'hour', discount: 0 });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`${API}/providers/services/${serviceId}`);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="provider-dashboard">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{t('welcome')}, {user?.name}!</h1>
              <p className="text-muted-foreground">Manage your services and bookings</p>
            </div>
          </div>

          {/* My Services */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('myServices')}</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="add-service-btn">
                      <Plus className="h-4 w-4" /> {t('addService')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('addService')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddService} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                          id="name"
                          data-testid="service-name-input"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                          <SelectTrigger data-testid="category-select">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          data-testid="description-input"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="base_price">Base Price</Label>
                          <Input
                            id="base_price"
                            data-testid="price-input"
                            type="number"
                            step="0.01"
                            value={formData.base_price}
                            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="discount">Discount (%)</Label>
                          <Input
                            id="discount"
                            data-testid="discount-input"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" data-testid="submit-service-btn">
                        Add Service
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading services...</div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No services added yet. Add your first service!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service, index) => (
                    <div
                      key={service.service_id}
                      className="border rounded-lg p-4"
                      data-testid={`service-card-${index}`}
                    >
                      <h3 className="font-semibold mb-2">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="space-y-1 text-sm mb-4">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-semibold">₹{service.base_price}</span>
                        </div>
                        {service.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>{service.discount}%</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => handleDeleteService(service.service_id)}
                        data-testid={`delete-service-${index}`}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No service requests yet
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <div
                      key={booking.booking_id}
                      className="border rounded-lg p-4"
                      data-testid={`booking-${index}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{booking.service?.name}</h3>
                          <p className="text-sm text-muted-foreground">Customer: {booking.user?.name}</p>
                          <p className="text-sm text-muted-foreground">Phone: {booking.user?.phone}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">₹{booking.total_amount}</span>
                      </div>
                      <div className="text-sm">
                        <p><strong>Duration:</strong> {booking.hours_days} hours</p>
                        <p><strong>Payment:</strong> {booking.payment_method}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
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

export default ProviderDashboard;