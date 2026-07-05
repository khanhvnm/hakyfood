import { createFileRoute, Link } from '@tanstack/react-router';
import { useClientMenu } from '@/features/menu/api/hooks';
import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { ClientMenuFoodResponse } from '@/features/menu/types';

export const Route = createFileRoute('/_public/foods')({
  component: FoodsSearchPage,
});

function FoodsSearchPage() {
  const { data: categories, isLoading } = useClientMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  // Flatten tất cả foods từ cây danh mục
  const allFoods = useMemo(() => {
    if (!categories) return [];
    const foods: (ClientMenuFoodResponse & { categoryName: string; categorySlug: string })[] = [];

    const extractFoods = (cats: typeof categories) => {
      for (const cat of cats) {
        if (cat.foods) {
          for (const food of cat.foods) {
            foods.push({ ...food, categoryName: cat.name, categorySlug: cat.slug });
          }
        }
        if (cat.children) {
          extractFoods(cat.children);
        }
      }
    };
    extractFoods(categories);
    return foods;
  }, [categories]);

  // Lấy danh sách danh mục lá (có foods) để làm bộ lọc
  const filterCategories = useMemo(() => {
    if (!categories) return [];
    const cats: { name: string; slug: string; count: number }[] = [];

    const extractCats = (list: typeof categories) => {
      for (const cat of list) {
        if (cat.foods && cat.foods.length > 0) {
          cats.push({ name: cat.name, slug: cat.slug, count: cat.foods.length });
        }
        if (cat.children) {
          extractCats(cat.children);
        }
      }
    };
    extractCats(categories);
    return cats;
  }, [categories]);

  // Lọc & tìm kiếm
  const filteredFoods = useMemo(() => {
    let result = allFoods;

    if (selectedCategorySlug) {
      result = result.filter((f) => f.categorySlug === selectedCategorySlug);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          (f.description && f.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allFoods, selectedCategorySlug, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-hk-display text-2xl sm:text-3xl font-extrabold text-hk-text-primary">
          Thực đơn
        </h1>
        <p className="text-xs text-hk-text-muted mt-1">
          Khám phá {allFoods.length} món ăn đa dạng tại HakyFood
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hk-text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-hk-border rounded-xl text-xs bg-hk-bg-surface focus:border-hk-primary focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-hk-text-muted hover:text-hk-text-primary cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Indicator */}
        <div className="flex items-center gap-2 text-xs text-hk-text-muted">
          <SlidersHorizontal size={14} />
          <span>{filteredFoods.length} kết quả</span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategorySlug(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedCategorySlug === null
              ? 'bg-hk-primary text-white shadow-sm'
              : 'bg-hk-bg-surface border border-hk-border text-hk-text-secondary hover:border-hk-primary hover:text-hk-primary'
          }`}
        >
          Tất cả
        </button>
        {filterCategories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategorySlug(cat.slug === selectedCategorySlug ? null : cat.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategorySlug === cat.slug
                ? 'bg-hk-primary text-white shadow-sm'
                : 'bg-hk-bg-surface border border-hk-border text-hk-text-secondary hover:border-hk-primary hover:text-hk-primary'
            }`}
          >
            {cat.name}
            <span className="ml-1 opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Foods Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-hk-primary/30 border-t-hk-primary rounded-full animate-spin" />
        </div>
      ) : filteredFoods.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFoods.map((food) => (
            <Link
              key={food.id}
              to="/foods/$slug"
              params={{ slug: food.slug }}
              className="group bg-hk-bg-surface border border-hk-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-hk-bg-surface-sunken">
                {food.imageUrl ? (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-hk-text-disabled">
                    🍽️
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-hk-display text-xs font-bold text-hk-text-primary line-clamp-2 leading-snug group-hover:text-hk-primary transition-colors">
                  {food.name}
                </h3>
                <p className="text-[10px] text-hk-text-muted mt-1 line-clamp-1">
                  {food.categoryName}
                </p>
                <p className="font-hk-display text-sm font-black text-hk-primary mt-2">
                  {formatPrice(food.basePrice)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-hk-display text-sm font-bold text-hk-text-primary">
            Không tìm thấy món ăn
          </p>
          <p className="text-xs text-hk-text-muted mt-1">
            Thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc danh mục.
          </p>
        </div>
      )}
    </div>
  );
}
