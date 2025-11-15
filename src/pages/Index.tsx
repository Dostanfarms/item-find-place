import { Header } from "@/components/Header";
import { UniversalSearchBar } from "@/components/UniversalSearchBar";
import { ServiceCategories } from "@/components/ServiceCategories";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      <main>
        <UniversalSearchBar />
        <ServiceCategories onFoodDeliveryClick={() => navigate('/restaurants')} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
