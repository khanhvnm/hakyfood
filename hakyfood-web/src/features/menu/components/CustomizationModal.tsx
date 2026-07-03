import { useState, useEffect } from 'react';
import { useClientFoodDetail } from '../api/hooks';
import { useCartStore } from '@/features/cart/store/useCartStore';
import type { SelectedOption } from '@/features/cart/store/useCartStore';
import type { OptionGroupResponse, OptionItemResponse } from '../types';
import { toast } from 'sonner';
import { X, Check } from 'lucide-react';

interface CustomizationModalProps {
  foodId: string;
  onClose: () => void;
}

export function CustomizationModal({ foodId, onClose }: CustomizationModalProps) {
  const { data: food, isLoading, error } = useClientFoodDetail(foodId);
  const addToCart = useCartStore((state) => state.addToCart);

  // State lưu trữ các option items đã chọn theo từng Option Group ID
  const [selections, setSelections] = useState<Record<string, OptionItemResponse[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Thiết lập lựa chọn mặc định khi dữ liệu tải xong
  useEffect(() => {
    if (food) {
      setActiveImageIndex(0);
      const initialSelections: Record<string, OptionItemResponse[]> = {};
      if (food.optionGroups) {
        food.optionGroups.forEach((group) => {
          // Nếu là nhóm bắt buộc chọn và chỉ chọn 1, chọn mặc định phần tử đầu tiên
          if (group.isRequired && group.maxChoices === 1 && group.optionItems.length > 0) {
            initialSelections[group.id] = [group.optionItems[0]];
          } else {
            initialSelections[group.id] = [];
          }
        });
      }
      setSelections(initialSelections);
    }
  }, [food]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-hk-bg-surface p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-hk-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-hk-body text-xs text-hk-text-secondary">Đang tải món ăn...</span>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-hk-bg-surface p-6 rounded-2xl shadow-xl max-w-sm w-full flex flex-col items-center text-center gap-4">
          <span className="text-hk-status-error text-sm font-bold">Lỗi: {error?.message || 'Không tìm thấy món ăn'}</span>
          <button onClick={onClose} className="px-4 py-2 bg-hk-primary text-white text-xs font-bold rounded-xl">Đóng</button>
        </div>
      </div>
    );
  }

  // --- Xử lý chọn Option ---
  const handleSelectOption = (group: OptionGroupResponse, item: OptionItemResponse, checked: boolean) => {
    setSelections((prev) => {
      const currentList = prev[group.id] ? [...prev[group.id]] : [];

      if (group.maxChoices === 1) {
        // Radio button logic: luôn thay thế bằng item mới chọn
        return {
          ...prev,
          [group.id]: checked ? [item] : [],
        };
      } else {
        // Checkbox logic: thêm hoặc bớt
        if (checked) {
          if (currentList.length < group.maxChoices) {
            currentList.push(item);
          }
        } else {
          const index = currentList.findIndex((i) => i.id === item.id);
          if (index > -1) {
            currentList.splice(index, 1);
          }
        }
        return {
          ...prev,
          [group.id]: currentList,
        };
      }
    });
  };

  // --- Tính tổng giá món ---
  const calculateTotalUnitPrice = () => {
    let optionTotal = 0;
    Object.values(selections).forEach((items) => {
      items.forEach((item) => {
        optionTotal += item.additionalPrice;
      });
    });
    return food.basePrice + optionTotal;
  };

  const totalUnitPrice = calculateTotalUnitPrice();
  const totalPrice = totalUnitPrice * quantity;

  // --- Kiểm tra ràng buộc validation ---
  const isValidationPassed = () => {
    if (!food.optionGroups) return true;

    return food.optionGroups.every((group) => {
      const selectedCount = selections[group.id]?.length || 0;
      return selectedCount >= group.minChoices && selectedCount <= group.maxChoices;
    });
  };

  const handleAddToCart = () => {
    if (!isValidationPassed()) {
      toast.error('Vui lòng chọn đầy đủ các tùy chọn bắt buộc.');
      return;
    }

    const selectedOptions: SelectedOption[] = [];
    food.optionGroups.forEach((group) => {
      const chosenItems = selections[group.id] || [];
      chosenItems.forEach((item) => {
        selectedOptions.push({
          optionGroupId: group.id,
          optionGroupName: group.name,
          optionItemId: item.id,
          optionItemName: item.name,
          additionalPrice: item.additionalPrice,
        });
      });
    });

    addToCart({
      foodId: food.id,
      name: food.name,
      imageUrl: food.imageUrl,
      basePrice: food.basePrice,
      selectedOptions,
      quantity,
      totalUnitPrice,
    });

    toast.success(`Đã thêm ${quantity} x ${food.name} vào giỏ hàng!`);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative bg-hk-bg-surface w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Banner Món ăn */}
        <div className="relative aspect-video w-full bg-hk-bg-surface-sunken">
          {(() => {
            const allImages = [food.imageUrl, ...(food.detailImageUrls || [])].filter(Boolean) as string[];
            if (allImages.length === 0) {
              return (
                <div className="flex items-center justify-center w-full h-full text-hk-text-muted text-sm font-hk-body">
                  Không có hình ảnh
                </div>
              );
            }
            return (
              <>
                <img src={allImages[activeImageIndex]} alt={food.name} className="w-full h-full object-cover transition-all duration-300" />
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-7 h-7 flex items-center justify-center rounded-full cursor-pointer hover:scale-105 transition-all text-xs z-10"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-7 h-7 flex items-center justify-center rounded-full cursor-pointer hover:scale-105 transition-all text-xs z-10"
                    >
                      ▶
                    </button>
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                            i === activeImageIndex ? 'bg-hk-primary scale-125' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}
          {/* Tên món nằm trên banner */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
            <h3 className="font-hk-display text-2xl font-bold text-white mb-1">{food.name}</h3>
            <p className="font-hk-body text-xs text-white/80 line-clamp-2">{food.description}</p>
          </div>
        </div>

        {/* Nội dung Tùy chọn (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {food.optionGroups && food.optionGroups.map((group) => {
            const selectedList = selections[group.id] || [];
            const isGroupValid = selectedList.length >= group.minChoices && selectedList.length <= group.maxChoices;
            const isLimitReached = selectedList.length >= group.maxChoices;

            return (
              <div key={group.id} className="border-b border-hk-border-subtle pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-hk-display text-sm font-bold text-hk-text-primary mr-2">{group.name}</span>
                    {group.isRequired && (
                      <span className="text-[10px] bg-hk-primary-subtle text-hk-primary font-bold px-1.5 py-0.5 rounded-md">Bắt buộc</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-hk-body font-semibold px-2 py-0.5 rounded-full ${isGroupValid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-hk-status-error'}`}>
                    {group.minChoices > 0 
                      ? `Chọn tối thiểu ${group.minChoices}${group.maxChoices > 1 ? `, tối đa ${group.maxChoices}` : ''}`
                      : `Chọn tối đa ${group.maxChoices}`
                    }
                  </span>
                </div>

                {group.description && (
                  <p className="font-hk-body text-xs text-hk-text-muted mb-3">{group.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.optionItems.map((item) => {
                    const isSelected = selectedList.some((i) => i.id === item.id);
                    const isGroupRadio = group.maxChoices === 1;
                    const isDisabled = !isSelected && isLimitReached && !isGroupRadio;

                    return (
                      <button
                        key={item.id}
                        disabled={isDisabled}
                        onClick={() => handleSelectOption(group, item, !isSelected)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-hk-primary bg-hk-primary-subtle/20 text-hk-primary'
                            : isDisabled
                              ? 'border-hk-border-subtle opacity-50 cursor-not-allowed bg-hk-bg-surface-sunken'
                              : 'border-hk-border-subtle hover:border-hk-primary-hover hover:bg-hk-bg-surface-raised'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Indicator Checkbox / Radio */}
                          <div className={`w-4 h-4 flex items-center justify-center border transition-all ${
                            isGroupRadio ? 'rounded-full' : 'rounded-md'
                          } ${isSelected ? 'bg-hk-primary border-hk-primary text-white' : 'border-hk-border'}`}>
                            {isSelected && <Check size={10} strokeWidth={4} />}
                          </div>
                          <span className="font-hk-body text-xs font-semibold">{item.name}</span>
                        </div>

                        {item.additionalPrice > 0 && (
                          <span className="font-hk-display text-xs font-bold">
                            +{formatPrice(item.additionalPrice)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh thanh toán Footer */}
        <div className="p-6 bg-hk-bg-surface-raised border-t border-hk-border flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Điều chỉnh số lượng */}
          <div className="flex items-center gap-3 border border-hk-border rounded-xl px-3 py-1.5 bg-hk-bg-surface">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-hk-text-secondary hover:text-hk-primary font-bold px-2 py-0.5 active:scale-90 cursor-pointer"
            >
              -
            </button>
            <span className="font-hk-display text-sm font-bold text-hk-text-primary min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-hk-text-secondary hover:text-hk-primary font-bold px-2 py-0.5 active:scale-90 cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Nút thanh toán */}
          <button
            onClick={handleAddToCart}
            disabled={!isValidationPassed()}
            className={`w-full sm:w-auto px-8 py-3.5 font-semibold rounded-xl text-sm shadow-md transition-all cursor-pointer flex justify-between sm:justify-start items-center gap-6 ${
              isValidationPassed()
                ? 'bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white shadow-hk-primary/20'
                : 'bg-hk-border text-hk-text-disabled cursor-not-allowed shadow-none'
            }`}
          >
            <span>Thêm vào giỏ</span>
            <span className="font-bold border-l border-white/20 pl-4">{formatPrice(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
