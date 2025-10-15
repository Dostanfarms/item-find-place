import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Clock, MapPin } from "lucide-react";
import { RestaurantCard } from "@/components/RestaurantCard";
import { useCart } from "@/contexts/CartContext";
import restaurant1 from "@/assets/restaurant-1.jpg";

interface Restaurant {
  id: string;
  seller_name: string;
  profile_photo_url: string | null;
  owner_name: string;
  mobile: string;
  is_online?: boolean;
  average_rating?: number;
  total_ratings?: number;
}

interface MenuItem {
  id: string;
  item_name: string;
  seller_price: number;
  franchise_price: number;
  item_photo_url: string | null;
  is_active: boolean;
}

const RestaurantMenu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [similarRestaurants, setSimilarRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('sellers')
        .select('id, seller_name, profile_photo_url, owner_name, mobile, is_online')
        .eq('id', restaurantId)
        .eq('status', 'approved')
        .single();

      if (restaurantError) throw restaurantError;
      
      // Fetch rating for this restaurant
      const { data: ratingData } = await supabase
        .rpc('get_seller_rating', { seller_uuid: restaurantId });
      
      setRestaurant({
        ...restaurantData,
        average_rating: ratingData?.[0]?.average_rating || 0,
        total_ratings: ratingData?.[0]?.total_ratings || 0,
      });

      // Fetch menu items (include all items, both active and inactive)
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('seller_id', restaurantId);

      if (itemsError) throw itemsError;
      setMenuItems(itemsData || []);

      // Fetch similar restaurants (other approved sellers)
      const { data: similarData, error: similarError } = await supabase
        .from('sellers')
        .select('id, seller_name, profile_photo_url, owner_name, mobile, is_online')
        .eq('status', 'approved')
        .neq('id', restaurantId)
        .limit(3);

      if (similarError) throw similarError;
      
      // Fetch ratings for similar restaurants
      const similarWithRatings = await Promise.all(
        (similarData || []).map(async (restaurant) => {
          const { data: ratingData } = await supabase
            .rpc('get_seller_rating', { seller_uuid: restaurant.id });
          
          return {
            ...restaurant,
            average_rating: ratingData?.[0]?.average_rating || 0,
            total_ratings: ratingData?.[0]?.total_ratings || 0,
          };
        })
      );
      
      setSimilarRestaurants(similarWithRatings);

    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    
    addToCart({
      id: item.id,
      item_name: item.item_name,
      seller_price: item.seller_price,
      item_photo_url: item.item_photo_url,
      seller_id: restaurantId!,
      seller_name: restaurant.seller_name,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading restaurant...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
            <Button onClick={() => navigate('/')}>
              Go back to home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <Header />
      </div>
      
      <main className="container mx-auto px-4 py-6 max-w-full overflow-x-hidden pt-24">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to restaurants
        </Button>

        {/* Restaurant Header */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-card">
          {restaurant.is_online === false && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Currently Offline</Badge>
                <span className="text-sm text-muted-foreground">This restaurant is not taking orders right now</span>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <img
              src={restaurant.profile_photo_url || restaurant1}
              alt={restaurant.seller_name}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0 ${restaurant.is_online === false ? 'grayscale' : ''}`}
            />
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground break-words">
                  {restaurant.seller_name}
                </h1>
                <Badge variant={restaurant.is_online !== false ? "default" : "secondary"} className="flex-shrink-0">
                  {restaurant.is_online !== false ? "Online" : "Offline"}
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 break-words">Owner: {restaurant.owner_name}</p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-food-green fill-current flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {restaurant.average_rating > 0 ? restaurant.average_rating : 'New'} 
                    {restaurant.total_ratings > 0 && ` (${restaurant.total_ratings})`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{restaurant.is_online !== false ? "25-35 min" : "Offline"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">1.2 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Menu Items</h2>
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.item_photo_url || restaurant1}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.item_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-bold text-primary">
                        ₹{item.seller_price}
                      </div>
                      <Badge variant={item.is_active && restaurant.is_online !== false ? "default" : "destructive"}>
                        {item.is_active && restaurant.is_online !== false ? "Available" : "Out of Stock"}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full" 
                      variant={item.is_active && restaurant.is_online !== false ? "food" : "outline"}
                      disabled={!item.is_active || restaurant.is_online === false}
                      onClick={() => handleAddToCart(item)}
                    >
                      {item.is_active && restaurant.is_online !== false ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Similar Restaurants */}
        {similarRestaurants.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Similar Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarRestaurants.map((similarRestaurant) => (
                <RestaurantCard
                  key={similarRestaurant.id}
                  id={similarRestaurant.id}
                  name={similarRestaurant.seller_name}
                  image={similarRestaurant.profile_photo_url || restaurant1}
                  cuisine={["Restaurant"]}
                  rating={similarRestaurant.average_rating || 0}
                  reviewsCount={similarRestaurant.total_ratings || 0}
                  deliveryTime={similarRestaurant.is_online !== false ? "25-35 min" : "Currently not taking orders"}
                  deliveryFee={0}
                  distance="1.2 km"
                  offers={similarRestaurant.is_online !== false ? ["Fresh & Delicious"] : ["Offline"]}
                  onClick={() => navigate(`/restaurant/${similarRestaurant.id}`)}
                  isOffline={similarRestaurant.is_online === false}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantMenu;