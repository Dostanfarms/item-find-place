import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CuisineCategories } from "@/components/CuisineCategories";
import { FeaturedRestaurants } from "@/components/FeaturedRestaurants";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CuisineCategories />
        <FeaturedRestaurants />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
