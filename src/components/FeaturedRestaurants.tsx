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
  average_rating?: number;
  total_ratings?: number;
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
      setLoading(true);
      const { data, error } = await supabase
        .from('sellers')
        .select('id, seller_name, profile_photo_url, status, is_online')
        .eq('status', 'approved');

      if (error) throw error;
      
      // Fetch ratings for each restaurant
      const restaurantsWithRatings = await Promise.all(
        (data || []).map(async (restaurant) => {
          const { data: ratingData } = await supabase
            .rpc('get_seller_rating', { seller_uuid: restaurant.id });
          
          return {
            ...restaurant,
            average_rating: ratingData?.[0]?.average_rating || 0,
            total_ratings: ratingData?.[0]?.total_ratings || 0,
          };
        })
      );
      
      setRestaurants(restaurantsWithRatings);
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
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Loading restaurants...</div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
      {restaurants.map(restaurant => (
        <RestaurantCard 
          key={restaurant.id} 
          id={restaurant.id} 
          name={restaurant.seller_name} 
          image={restaurant.profile_photo_url || restaurant1} 
          cuisine={["Restaurant"]} 
          rating={restaurant.average_rating || 0} 
          reviewsCount={restaurant.total_ratings || 0} 
          deliveryTime={restaurant.is_online !== false ? "25-35 min" : "Currently not taking orders"} 
          deliveryFee={0} 
          distance="1.2 km" 
          offers={restaurant.is_online !== false ? ["Fresh & Delicious"] : ["Offline"]} 
          onClick={() => handleRestaurantClick(restaurant.id)} 
          isOffline={restaurant.is_online === false} 
        />
      ))}
    </div>
  );
};