import { Header } from "@/components/Header";
import { UniversalSearchBar } from "@/components/UniversalSearchBar";
import { ServiceCategories } from "@/components/ServiceCategories";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <UniversalSearchBar />
        <ServiceCategories onFoodDeliveryClick={() => navigate('/restaurants')} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
