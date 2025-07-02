
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Leaf,
  ArrowRight,
  TrendingUp,
  Star
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Package className="h-8 w-8 text-green-600" />,
      title: "Product Management",
      description: "Manage your fresh produce inventory with ease",
      action: () => navigate('/products')
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Customer Management", 
      description: "Keep track of your valued customers",
      action: () => navigate('/customers')
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-purple-600" />,
      title: "Sales Dashboard",
      description: "Process sales and manage transactions",
      action: () => navigate('/sales-dashboard')
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Analytics",
      description: "View sales reports and business insights",
      action: () => navigate('/dashboard')
    }
  ];

  const stats = [
    { label: "Fresh Products", value: "500+", icon: <Leaf className="h-5 w-5" /> },
    { label: "Happy Customers", value: "1000+", icon: <Users className="h-5 w-5" /> },
    { label: "Daily Sales", value: "₹50K+", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Quality Rating", value: "4.9★", icon: <Star className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DostanFarms</h1>
                <p className="text-sm text-green-600">Farm Management System</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to
              <span className="text-green-600 block">DostanFarms</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your complete farm management solution for fresh, organic produce. 
              Manage inventory, track sales, and grow your business with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/sales-dashboard')}
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              >
                Start Selling
                <ShoppingCart className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-3"
              >
                View Dashboard
                <BarChart3 className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3 text-green-600">
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Farm
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your operations with our comprehensive farm management tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={feature.action}
              >
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-center text-green-600 group-hover:text-green-700">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Farm?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of farmers who trust DostanFarms to manage their operations efficiently
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Access Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/sales-dashboard')}
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-3"
            >
              Start Your First Sale
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">DostanFarms</span>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering farmers with modern technology for sustainable agriculture
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2024 DostanFarms. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
