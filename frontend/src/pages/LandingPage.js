import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Search, Truck, Package, Wrench, Droplet, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const categories = [
    { name: 'Earth Movers', icon: Truck, color: 'bg-orange-100 text-orange-600' },
    { name: 'Packers & Movers', icon: Package, color: 'bg-blue-100 text-blue-600' },
    { name: 'Power Tools', icon: Wrench, color: 'bg-green-100 text-green-600' },
    { name: 'Bore Well', icon: Droplet, color: 'bg-cyan-100 text-cyan-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-[60vh] flex items-center overflow-hidden"
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight text-white">
              Find Trusted Service Providers Across <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Tamil Nadu</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8">
              Connect with verified earth movers, packers, bore well services, and power tool rentals in your district.
            </p>
            <div className="flex flex-wrap gap-4">
              {!user ? (
                <>
                  <Link to="/register" data-testid="get-started-btn">
                    <Button size="lg" className="btn-primary gap-2">
                      Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/services" data-testid="browse-services-btn">
                    <Button size="lg" variant="outline" className="gap-2">
                      <Search className="h-5 w-5" /> Browse Services
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to={`/${user.role}-dashboard`} data-testid="dashboard-btn">
                  <Button size="lg" className="btn-primary gap-2">
                    Go to Dashboard <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24" data-testid="categories-section">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Service Categories</h2>
            <p className="text-muted-foreground text-lg">Professional services available in all 37 districts of Tamil Nadu</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} to={`/services?category=${encodeURIComponent(category.name)}`} data-testid={`category-link-${index}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-card border-2 border-border rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border-primary transition-all duration-300 cursor-pointer"
                    data-testid={`category-card-${index}`}
                  >
                    <div className={`${category.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                    <p className="text-muted-foreground text-sm">Professional and verified service providers</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30" data-testid="features-section">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose ServiceHub TN?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'District-wide Coverage', desc: 'Services available in all Tamil Nadu districts' },
              { title: 'Verified Providers', desc: 'All service providers are verified with ratings' },
              { title: 'Transparent Pricing', desc: 'Compare prices and discounts easily' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
                data-testid={`feature-${index}`}
              >
                <div className="bg-primary/10 w-16 h-16 rounded-sm mx-auto mb-4 flex items-center justify-center">
                  <div className="bg-primary w-8 h-8 rounded-sm"></div>
                </div>
                <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24" data-testid="cta-section">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of satisfied customers across Tamil Nadu</p>
            {!user && (
              <Link to="/register" data-testid="cta-register-btn">
                <Button size="lg" variant="secondary" className="gap-2">
                  Register Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" data-testid="footer">
        <div className="container mx-auto px-4 md:px-8 text-center text-muted-foreground">
          <p>© 2025 ServiceHub TN. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;