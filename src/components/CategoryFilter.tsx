
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  productCounts?: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect,
  productCounts = {}
}) => {
  const { categories } = useCategories();

  const activeCategories = categories.filter(cat => cat.is_active);

  return (
    <div className="flex flex-wrap gap-2 py-4 border-b">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategorySelect(null)}
        className="flex items-center gap-2"
      >
        All Products
        {productCounts.total && (
          <Badge variant="secondary" className="text-xs">
            {productCounts.total}
          </Badge>
        )}
      </Button>
      
      {activeCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.name ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect(category.name)}
          className="flex items-center gap-2"
        >
          {category.name}
          {productCounts[category.name] && (
            <Badge variant="secondary" className="text-xs">
              {productCounts[category.name]}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
