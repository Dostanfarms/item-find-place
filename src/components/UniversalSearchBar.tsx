import { useState } from "react";
import { Search, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export const UniversalSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleVoiceSearch = () => {
    toast({
      title: "Voice Search",
      description: "Voice search feature coming soon!",
    });
  };

  return (
    <div className="bg-background py-6 sticky top-16 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for 'Mango'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 text-base rounded-xl bg-muted/50 border-0 focus:bg-background shadow-sm"
          />
          <button
            onClick={handleVoiceSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
          >
            <Mic className="h-5 w-5 text-primary hover:text-primary/80 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
