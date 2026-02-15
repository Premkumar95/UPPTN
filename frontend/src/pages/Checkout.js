import React from 'react';
import { Navbar } from '../components/Navbar';

const Checkout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="checkout-page">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <p className="text-muted-foreground">Checkout functionality - to be implemented with address selection and payment</p>
      </div>
    </div>
  );
};

export default Checkout;