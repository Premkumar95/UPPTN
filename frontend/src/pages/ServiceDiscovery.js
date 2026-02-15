import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Search, MapPin, Star, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServiceDiscovery = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filters, setFilters] = useState({
    keyword: '',
    district: '',
    category: searchParams.get('category') || '',
  });

  useEffect(() => {
    fetchDistricts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [filters, currentPage]);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API}/districts`);
      setDistricts(response.data.districts);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.district) params.append('district', filters.district);
      if (filters.category) params.append('category', filters.category);

      const response = await axios.get(`${API}/services?${params.toString()}`);
      setServices(response.data);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="service-discovery-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('services')}
            </h1>
            {filters.category && (
              <p className="text-lg text-muted-foreground">
                Showing results for <span className="font-bold text-foreground">{filters.category}</span>
              </p>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-8 border-2 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Search services (e.g., JCB, Packers, Drilling...)"
                    data-testid="search-input"
                    className="h-12 text-base"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  />
                </div>
                <Select value={filters.district || 'all'} onValueChange={(value) => handleFilterChange('district', value === 'all' ? '' : value)}>
                  <SelectTrigger data-testid="district-select" className="h-12">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map((dist) => (
                      <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                  <SelectTrigger data-testid="category-select" className="h-12">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Items per page selector */}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-slate-300">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-24 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-400">services per page</span>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-300">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No services found. Try different filters.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-slate-300">
                Showing {startIndex + 1}-{Math.min(endIndex, services.length)} of {services.length} services
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentServices.map((service, index) => (
                <motion.div
                  key={service.service_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  data-testid={`service-card-${index}`}
                >
                  <Card className="h-full hover:border-primary transition-all duration-300 hover:shadow-xl border-2 overflow-hidden group">
                    <CardHeader className="bg-gradient-to-br from-primary/5 to-secondary/5 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {service.name}
                        </CardTitle>
                        {service.discount > 0 && (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {service.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(service.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : i < service.rating
                                  ? 'fill-yellow-200 text-yellow-400'
                                  : 'fill-gray-200 text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-foreground">{service.rating}/5</span>
                        <Award className="h-4 w-4 text-yellow-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                      <div className="space-y-3">
                        {service.district && (
                          <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-900">{service.district}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                          <span className="text-sm font-medium">Price:</span>
                          <span className="text-xl font-bold text-primary">₹{service.base_price}</span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          <strong>Provider:</strong> {service.provider?.name || 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Link to={`/services/${service.service_id}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold" data-testid={`view-details-btn-${index}`}>
                          VIEW DETAILS →
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDiscovery;
