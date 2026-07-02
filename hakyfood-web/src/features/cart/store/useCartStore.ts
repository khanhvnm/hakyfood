import { create } from 'zustand';

export interface SelectedOption {
  optionGroupId: string;
  optionGroupName: string;
  optionItemId: string;
  optionItemName: string;
  additionalPrice: number;
}

export interface CartItem {
  cartItemId: string; // ID duy nhất để phân biệt các dòng hàng trong giỏ
  foodId: string;
  name: string;
  imageUrl?: string;
  basePrice: number;
  selectedOptions: SelectedOption[];
  quantity: number;
  totalUnitPrice: number; // basePrice + tổng additionalPrice của các option
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotalItems: () => number;
  getCartTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (newItem) => {
    set((state) => {
      // Tìm xem đã có món tương tự (cùng foodId và cùng danh sách selectedOptions) trong giỏ chưa
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.foodId === newItem.foodId &&
          areOptionsEqual(item.selectedOptions, newItem.selectedOptions)
      );

      if (existingItemIndex > -1) {
        // Nếu đã có, cộng dồn số lượng
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return { items: updatedItems };
      } else {
        // Nếu chưa có, sinh cartItemId ngẫu nhiên và thêm mới
        const cartItemId = Math.random().toString(36).substring(2, 9);
        const itemWithId: CartItem = {
          ...newItem,
          cartItemId,
        };
        return { items: [...state.items, itemWithId] };
      }
    });
  },

  removeFromCart: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getCartTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getCartTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.totalUnitPrice * item.quantity, 0);
  },
}));

/**
 * Hàm hỗ trợ so sánh 2 tập hợp selected options xem có giống nhau hoàn toàn hay không
 */
function areOptionsEqual(a: SelectedOption[], b: SelectedOption[]): boolean {
  if (a.length !== b.length) return false;
  
  // Sắp xếp theo ID của option item để so sánh chính xác
  const sortedA = [...a].sort((x, y) => x.optionItemId.localeCompare(y.optionItemId));
  const sortedB = [...b].sort((x, y) => x.optionItemId.localeCompare(y.optionItemId));

  return sortedA.every((opt, index) => opt.optionItemId === sortedB[index].optionItemId);
}
