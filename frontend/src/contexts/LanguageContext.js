import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    pin: 'PIN',
    phone: 'Phone Number',
    name: 'Name',
    logout: 'Logout',
    userType: 'I am a',
    user: 'User',
    provider: 'Service Provider',
    services: 'Services',
    bookings: 'Bookings',
    cart: 'Cart',
    profile: 'Profile',
    search: 'Search services...',
    district: 'District',
    category: 'Category',
    allDistricts: 'All Districts',
    allCategories: 'All Categories',
    viewDetails: 'View Details',
    addToCart: 'Add to Cart',
    book: 'Book Now',
    status: 'Status',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    paymentMethod: 'Payment Method',
    upi: 'UPI',
    cash: 'Cash',
    advanceUpi: 'Advance UPI',
    address: 'Address',
    addAddress: 'Add Address',
    streetName: 'Street Name',
    city: 'City',
    pincode: 'Pincode',
    landmark: 'Landmark (Optional)',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    changePin: 'Change PIN',
    forgotPin: 'Forgot PIN?',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    resendOtp: 'Resend OTP',
    trackBooking: 'Track Booking',
    bookingId: 'Booking ID',
    myServices: 'My Services',
    addService: 'Add Service',
    editService: 'Edit Service',
    deleteService: 'Delete Service',
    servicePrice: 'Price',
    discount: 'Discount',
    description: 'Description',
    contactProvider: 'Contact Provider',
  },
  ta: {
    welcome: 'வரவேற்கிறோம்',
    login: 'உள்நுழைய',
    register: 'பதிவு செய்ய',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    pin: 'பின்',
    phone: 'தொலைபேசி எண்',
    name: 'பெயர்',
    logout: 'வெளியேறு',
    userType: 'நான் ஒரு',
    user: 'பயனர்',
    provider: 'சேவை வழங்குநர்',
    services: 'சேவைகள்',
    bookings: 'முன்பதிவுகள்',
    cart: 'கார்ட்',
    profile: 'சுயவிவரம்',
    search: 'சேவைகளைத் தேடுங்கள்...',
    district: 'மாவட்டம்',
    category: 'வகை',
    allDistricts: 'அனைத்து மாவட்டங்கள்',
    allCategories: 'அனைத்து வகைகள்',
    viewDetails: 'விவரங்களைக் காண்க',
    addToCart: 'கார்ட்டில் சேர்க்கவும்',
    book: 'இப்போதே முன்பதிவு செய்க',
    status: 'நிலை',
    pending: 'நிலுவையில்',
    inProgress: 'செயல்பாட்டில்',
    completed: 'நிறைவு',
    paymentMethod: 'கட்டண முறை',
    upi: 'யூபிஐ',
    cash: 'பணம்',
    advanceUpi: 'முன்கூட்டியே யூபிஐ',
    address: 'முகவரி',
    addAddress: 'முகவரி சேர்க்கவும்',
    streetName: 'தெரு பெயர்',
    city: 'நகரம்',
    pincode: 'அஞ்சல் குறியீடு',
    landmark: 'அடையாளம் (விருப்பம்)',
    save: 'சேமிக்கவும்',
    cancel: 'ரத்துசெய்',
    submit: 'சமர்ப்பிக்கவும்',
    changePin: 'பின் மாற்றவும்',
    forgotPin: 'பின் மறந்துவிட்டதா?',
    sendOtp: 'ஓடிபி அனுப்பவும்',
    verifyOtp: 'ஓடிபி சரிபார்க்கவும்',
    resendOtp: 'ஓடிபி மீண்டும் அனுப்பவும்',
    trackBooking: 'முன்பதிவைக் கண்காணிக்கவும்',
    bookingId: 'முன்பதிவு ஐடி',
    myServices: 'எனது சேவைகள்',
    addService: 'சேவை சேர்க்கவும்',
    editService: 'சேவையைத் திருத்தவும்',
    deleteService: 'சேவையை நீக்கவும்',
    servicePrice: 'விலை',
    discount: 'தள்ளுபடி',
    description: 'விளக்கம்',
    contactProvider: 'வழங்குநரைத் தொடர்பு கொள்ளவும்',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === 'ta' ? 'tamil-text' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};