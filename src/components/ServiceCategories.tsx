import { UtensilsCrossed, ShoppingBasket, Milk, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceCategoryProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ServiceCategoryCard = ({
  title,
  icon,
  onClick
}: ServiceCategoryProps) => {
  return (
    <div 
      className="relative bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group flex-1 min-h-0" 
      onClick={onClick}
    >
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
          {icon}
        </div>
        <h3 className="font-bold text-sm text-foreground text-center">{title}</h3>
      </div>
    </div>
  );
};

interface ServiceCategoriesProps {
  onFoodDeliveryClick: () => void;
}

export const ServiceCategories = ({
  onFoodDeliveryClick
}: ServiceCategoriesProps) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/restaurants?category=${category}`);
  };

  return (
    <section className="flex-1 bg-background flex flex-col min-h-0">
      <div className="container mx-auto px-4 flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto flex-1 min-h-0">
          <ServiceCategoryCard 
            title="Food Delivery" 
            icon={<UtensilsCrossed className="h-6 w-6" />} 
            onClick={() => handleCategoryClick('food_delivery')} 
          />
          
          <ServiceCategoryCard 
            title="Instamart" 
            icon={<ShoppingBasket className="h-6 w-6" />} 
            onClick={() => handleCategoryClick('instamart')} 
          />
          
          <ServiceCategoryCard 
            title="Dairy Products" 
            icon={<Milk className="h-6 w-6" />} 
            onClick={() => handleCategoryClick('dairy')} 
          />
          
          <ServiceCategoryCard 
            title="Services" 
            icon={<Package className="h-6 w-6" />} 
            onClick={() => handleCategoryClick('services')} 
          />
        </div>
      </div>
    </section>
  );
};