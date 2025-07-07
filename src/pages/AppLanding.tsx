
import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, UserCog, ShoppingBag } from 'lucide-react';

const AppLanding = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">Dostan Mart</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/farmer-login">
                <Button variant="outline" size="sm">Farmer Login</Button>
              </Link>
              <Link to="/employee-login">
                <Button variant="outline" size="sm">Employee Login</Button>
              </Link>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <ShoppingBag className="h-4 w-4" />
              </Button>
              <Link to="/customer-register">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/customer-register">
                <Button className="bg-green-600 hover:bg-green-700" size="sm">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Categories */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 py-4">
            <Link to="/app">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Shop All Products
              </Button>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/customer-products" state={{ selectedCategory: 'Dairy' }}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Dairy</Button>
              </Link>
              <Link to="/customer-products" state={{ selectedCategory: 'Grocery' }}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Grocery</Button>
              </Link>
              <Link to="/customer-products" state={{ selectedCategory: 'Fashion' }}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Fashion</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-amber-100 to-amber-200 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-center mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Explore the New
              <br />
              <span className="text-white/90">Fashion Styles</span>
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/app">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                  Shop Now
                </Button>
              </Link>
              <Link to="/customer-products" state={{ selectedCategory: 'Fashion' }}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg">
                  Explore Fashion
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Fashion Models Image Placeholder */}
        <div className="absolute bottom-0 right-0 w-full h-full opacity-30">
          <div className="h-full w-full bg-gradient-to-t from-amber-800/40 to-transparent"></div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get Started</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/farmer-login" className="w-full">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <User className="h-12 w-12 mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">Farmer Portal</h3>
                  <p className="text-gray-600 mb-4">Manage your products and track earnings</p>
                  <Button className="mt-auto bg-green-600 hover:bg-green-700">
                    Access Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/employee-login" className="w-full">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <UserCog className="h-12 w-12 mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-2">Employee Access</h3>
                  <p className="text-gray-600 mb-4">Admin dashboard and management tools</p>
                  <Button className="mt-auto bg-blue-600 hover:bg-blue-700">
                    Employee Login
                  </Button>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/app" className="w-full">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <ShoppingBag className="h-12 w-12 mb-4 text-purple-600" />
                  <h3 className="text-xl font-semibold mb-2">Shop Products</h3>
                  <p className="text-gray-600 mb-4">Browse and purchase fresh products</p>
                  <Button className="mt-auto bg-purple-600 hover:bg-purple-700">
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Registration CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">New Customer?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of satisfied customers</p>
          <Link to="/customer-register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
              Register Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AppLanding;
