import { createFileRoute, Link } from '@tanstack/react-router';
import { useClientMenu, useClientFoodDetail } from '@/features/menu/api/hooks';
import { useMemo, useState } from 'react';
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/_public/foods/$slug')({
  component: FoodDetailPage,
});

function FoodDetailPage() {
  const { slug } = Route.useParams();
  const { data: categories } = useClientMenu();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Tìm food ID từ slug thông qua dữ liệu menu đã cache
  const foodMeta = useMemo((): { id: string; name: string; slug: string; categoryName: string } | null => {
    if (!categories) return null;
    let found: { id: string; name: string; slug: string; categoryName: string } | null = null;

    const search = (cats: typeof categories) => {
      for (const cat of cats) {
        if (cat.foods) {
          for (const food of cat.foods) {
            if (food.slug === slug) {
              found = { id: food.id, name: food.name, slug: food.slug, categoryName: cat.name };
              return;
            }
          }
        }
        if (cat.children) search(cat.children);
      }
    };
    search(categories);
    return found;
  }, [categories, slug]);

  const foodId = foodMeta?.id || '';
  const { data: food, isLoading, isError } = useClientFoodDetail(foodId);

  // Xây dựng danh sách slide (ảnh + video)
  const slides = useMemo(() => {
    if (!food) return [];
    const items: { type: 'image' | 'video'; url: string }[] = [];

    if (food.imageUrl) {
      items.push({ type: 'image', url: food.imageUrl });
    }
    if (food.videoUrl) {
      items.push({ type: 'video', url: food.videoUrl });
    }
    if (food.detailImageUrls) {
      for (const url of food.detailImageUrls) {
        items.push({ type: 'image', url });
      }
    }
    return items;
  }, [food]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const prevSlide = () => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));

  if (isLoading || !food) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-hk-primary/30 border-t-hk-primary rounded-full animate-spin" />
          <p className="text-xs text-hk-text-muted">Đang tải chi tiết món ăn...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-32">
        <p className="text-4xl mb-3">😔</p>
        <p className="font-hk-display text-sm font-bold text-hk-text-primary">Không tìm thấy món ăn</p>
        <Link to="/foods" className="text-xs text-hk-primary hover:underline mt-2 inline-block">
          ← Quay lại thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-hk-text-muted mb-6">
        <Link to="/" className="hover:text-hk-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/foods" className="hover:text-hk-primary transition-colors">Thực đơn</Link>
        <span>/</span>
        <span className="text-hk-text-primary font-bold truncate max-w-[200px]">{food.name}</span>
      </nav>

      {/* Main Content: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* Left: Image Gallery / Video Player */}
        <div>
          {/* Main Slide */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-hk-bg-surface-sunken border border-hk-border-subtle shadow-sm">
            {slides.length > 0 ? (
              <>
                {slides[currentSlide]?.type === 'video' ? (
                  <video
                    src={slides[currentSlide].url}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={slides[currentSlide]?.url}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Navigation Arrows */}
                {slides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-all cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-all cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-hk-text-disabled">
                🍽️
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {slides.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === currentSlide
                      ? 'border-hk-primary shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {slide.type === 'video' ? (
                    <div className="w-full h-full bg-hk-bg-dark flex items-center justify-center text-white text-lg">
                      ▶
                    </div>
                  ) : (
                    <img src={slide.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Food Info & Options */}
        <div>
          {/* Category Tag */}
          {foodMeta?.categoryName && (
            <span className="inline-block text-[10px] font-bold text-hk-primary bg-hk-primary-subtle px-2.5 py-0.5 rounded-full mb-3">
              {foodMeta.categoryName}
            </span>
          )}

          {/* Name */}
          <h1 className="font-hk-display text-2xl sm:text-3xl font-extrabold text-hk-text-primary leading-tight">
            {food.name}
          </h1>

          {/* Price */}
          <p className="font-hk-display text-2xl font-black text-hk-primary mt-3">
            {formatPrice(food.basePrice)}
          </p>

          {/* Description */}
          {food.description && (
            <p className="text-xs text-hk-text-secondary leading-relaxed mt-4 border-t border-hk-border-subtle pt-4">
              {food.description}
            </p>
          )}

          {/* Option Groups */}
          {food.optionGroups && food.optionGroups.length > 0 && (
            <div className="mt-6 space-y-5">
              <h3 className="font-hk-display text-xs font-bold text-hk-text-primary uppercase tracking-wider">
                Tùy chỉnh
              </h3>
              {food.optionGroups.map((group) => (
                <div key={group.id} className="border border-hk-border-subtle rounded-xl p-4 bg-hk-bg-surface">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="font-hk-display text-xs font-bold text-hk-text-primary">
                      {group.name}
                      {group.isRequired && (
                        <span className="ml-2 text-[9px] bg-hk-primary-subtle text-hk-primary font-bold px-1.5 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-hk-text-muted">
                      Chọn {group.minChoices}–{group.maxChoices}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {group.optionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-hk-bg-surface-sunken transition-colors">
                        <span className="text-xs text-hk-text-secondary">{item.name}</span>
                        {item.additionalPrice > 0 && (
                          <span className="text-xs font-bold text-hk-primary">
                            +{formatPrice(item.additionalPrice)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart Button */}
          <button className="w-full mt-8 flex items-center justify-center gap-3 bg-hk-primary hover:bg-hk-primary-hover active:scale-[0.98] text-white font-hk-display font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer">
            <ShoppingBag size={18} />
            Thêm vào giỏ hàng — {formatPrice(food.basePrice)}
          </button>

          {/* Back Link */}
          <Link
            to="/foods"
            className="flex items-center gap-1.5 text-xs text-hk-text-muted hover:text-hk-primary transition-colors mt-4 justify-center"
          >
            <ArrowLeft size={12} />
            Quay lại thực đơn
          </Link>
        </div>
      </div>
    </div>
  );
}
