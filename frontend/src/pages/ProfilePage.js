import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, Mail, Phone, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8" data-testid="profile-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-8">Profile</h1>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-md">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-md">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-md">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{user?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-md">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-semibold capitalize">{user?.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;