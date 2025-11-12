import { Header } from "@/components/Header";
import { UniversalSearchBar } from "@/components/UniversalSearchBar";
import { FeaturedRestaurants } from "@/components/FeaturedRestaurants";
import { Footer } from "@/components/Footer";

const Restaurants = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <UniversalSearchBar />
        <section className="py-8 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Top Restaurants</h2>
            </div>
            <FeaturedRestaurants />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Restaurants;
