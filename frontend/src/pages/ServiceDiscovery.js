import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Navbar';
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
  const [filters, setFilters] = useState({
    keyword: '',
    district: '',
    category: searchParams.get('category') || '',
  });

  useEffect(() => {
    fetchDistricts();
    fetchCategories();
    fetchServices();
  }, []);

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
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchServices();
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">{t('services')}</h1>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder={t('search')}
                    data-testid="search-input"
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Select value={filters.district} onValueChange={(value) => setFilters({ ...filters, district: value === 'all' ? '' : value })}>
                  <SelectTrigger data-testid="district-select">
                    <SelectValue placeholder={t('allDistricts')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map((dist) => (
                      <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}>
                  <SelectTrigger data-testid="category-select">
                    <SelectValue placeholder={t('allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="btn-primary gap-2 w-full" data-testid="search-btn">
                <Search className="h-4 w-4" /> Search
              </Button>
            </CardContent>
          </Card>

          {/* Services Grid */}
          {loading ? (
            <div className="text-center py-12">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No services found. Try different filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.service_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  data-testid={`service-card-${index}`}
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{service.rating}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                      <div className="space-y-2">
                        {service.district && (
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span className="font-medium">{service.district}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Base Price:</span>
                          <span className="font-bold">₹{service.base_price}</span>
                        </div>
                        {service.discount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{t('discount')}:</span>
                            <span className="text-green-600 font-semibold">{service.discount}% OFF</span>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Provider: {service.provider?.name || 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/services/${service.service_id}`} className="w-full">
                        <Button className="w-full" data-testid={`view-details-btn-${index}`}>
                          {t('viewDetails')}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceDiscovery;