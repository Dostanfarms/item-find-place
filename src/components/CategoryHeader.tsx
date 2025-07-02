
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shirt, Carrot, Apple, Wheat, Milk, Package } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface CategoryHeaderProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  productCounts: Record<string, number>;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  selectedCategory,
  onCategoryChange,
  productCounts
}) => {
  const { categories, loading } = useCategories();

  // Icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fashion')) return Shirt;
    if (name.includes('vegetable')) return Carrot;
    if (name.includes('fruit')) return Apple;
    if (name.includes('grain')) return Wheat;
    if (name.includes('dairy')) return Milk;
    return Package;
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="text-center py-4">Loading categories...</div>
      </div>
    );
  }

  // Build categories array with "All" option
  const categoryOptions = [
    { value: 'all', label: 'All Categories', icon: null, count: Object.values(productCounts).reduce((a, b) => a + b, 0) },
    ...categories.map(category => ({
      value: category.name,
      label: category.name,
      icon: getCategoryIcon(category.name),
      count: productCounts[category.name] || 0
    }))
  ];

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Product Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.value)}
                  className="flex items-center gap-2"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {category.label}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by:</span>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    {category.icon && <category.icon className="h-4 w-4" />}
                    {category.label} ({category.count})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;
