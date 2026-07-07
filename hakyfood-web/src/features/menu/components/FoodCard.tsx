import type { ClientMenuFoodResponse } from '../types';

interface FoodCardProps {
  food: ClientMenuFoodResponse;
  onSelect: (food: ClientMenuFoodResponse) => void;
}

export function FoodCard({ food, onSelect }: FoodCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="flex flex-col bg-hk-bg-surface border border-hk-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Ảnh món ăn */}
      <div className="relative aspect-video w-full bg-hk-bg-surface-sunken overflow-hidden">
        {food.imageUrl ? (
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-hk-text-muted text-xs font-hk-body">
            Không có ảnh
          </div>
        )}
      </div>

      {/* Thông tin món ăn */}
      <div className="flex flex-col flex-grow p-4">
        <h4 className="font-hk-display text-base font-bold text-hk-text-primary line-clamp-1 mb-1">
          {food.name}
        </h4>
        
        <p className="font-hk-body text-xs text-hk-text-muted line-clamp-2 mb-4 min-h-[32px]">
          {food.description || 'Chưa có mô tả chi tiết cho món ăn này.'}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-hk-display text-sm font-bold text-hk-primary">
            {formatPrice(food.basePrice)}
          </span>

          <button
            onClick={() => onSelect(food)}
            className="px-4 py-1.5 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Chọn mua
          </button>
        </div>
      </div>
    </div>
  );
}
