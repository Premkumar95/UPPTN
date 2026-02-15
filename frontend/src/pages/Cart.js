import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`);
      setCart(response.data);
    } catch (error) {
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await axios.delete(`${API}/cart/${cartId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="cart-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">{t('cart')}</h1>

          {loading ? (
            <div className="text-center py-12">Loading cart...</div>
          ) : cart.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={() => navigate('/services')} data-testid="browse-services-btn">
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => (
                  <Card key={item.cart_id} data-testid={`cart-item-${index}`}>
                    <CardHeader>
                      <CardTitle className="text-xl">{item.service?.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Hours/Days:</span>
                          <span className="font-semibold">{item.hours_days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price per unit:</span>
                          <span>₹{item.service?.base_price}</span>
                        </div>
                        {item.service?.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>{item.service.discount}% OFF</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary">₹{item.total_amount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(item.cart_id)}
                        data-testid={`remove-item-${index}`}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full btn-primary"
                      onClick={() => navigate('/checkout')}
                      data-testid="checkout-btn"
                    >
                      Proceed to Checkout
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;