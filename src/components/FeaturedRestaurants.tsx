import { RestaurantCard } from "./RestaurantCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
interface Restaurant {
  id: string;
  seller_name: string;
  profile_photo_url: string | null;
  status: string;
  is_online?: boolean;
}
export const FeaturedRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchRestaurants();
  }, []);
  const fetchRestaurants = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('sellers').select('id, seller_name, profile_photo_url, status, is_online').eq('status', 'approved');
      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };
  if (loading) {
    return <section className="py-12 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading restaurants...</div>
          </div>
        </div>
      </section>;
  }
  return <section className="py-12 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Top Restaurants</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the best restaurants in your area with amazing offers and fast delivery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(restaurant => <RestaurantCard key={restaurant.id} id={restaurant.id} name={restaurant.seller_name} image={restaurant.profile_photo_url || restaurant1} cuisine={["Restaurant"]} rating={4.5} reviewsCount={100} deliveryTime={restaurant.is_online !== false ? "25-35 min" : "Currently not taking orders"} deliveryFee={0} distance="1.2 km" offers={restaurant.is_online !== false ? ["Fresh & Delicious"] : ["Offline"]} onClick={() => handleRestaurantClick(restaurant.id)} isOffline={restaurant.is_online === false} />)}
        </div>
      </div>
    </section>;
};