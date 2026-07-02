import { useState } from 'react';
import { useClientMenu } from '../api/hooks';
import { FoodCard } from './FoodCard';
import { CustomizationModal } from './CustomizationModal';
import type { ClientMenuCategoryResponse, ClientMenuFoodResponse } from '../types';

export function ClientMenu() {
  const { data: menuTree, isLoading, error } = useClientMenu();
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  // Lưu trữ danh mục đang được active thủ công (hoặc scroll link)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-hk-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-hk-body text-sm text-hk-text-secondary">Đang chuẩn bị thực đơn HakyFood...</p>
      </div>
    );
  }

  if (error || !menuTree) {
    return (
      <div className="text-center py-20">
        <p className="font-hk-body text-hk-status-error font-semibold">
          Không thể tải thực đơn. Vui lòng thử lại sau!
        </p>
      </div>
    );
  }

  // --- Scroll tới danh mục ---
  const handleScrollToCategory = (id: string) => {
    setActiveCategoryId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const yOffset = -80; // Tránh header che khuất
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // --- Render Sidebar đệ quy ---
  const renderSidebarItem = (cat: ClientMenuCategoryResponse, level = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isActive = activeCategoryId === cat.id;

    return (
      <div key={cat.id} className="flex flex-col">
        <button
          onClick={() => handleScrollToCategory(cat.id)}
          style={{ paddingLeft: `${level * 12 + 16}px` }}
          className={`py-2 text-left text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            isActive
              ? 'bg-hk-primary-subtle text-hk-primary font-bold shadow-sm'
              : 'text-hk-text-secondary hover:text-hk-primary hover:bg-hk-bg-surface-raised'
          }`}
        >
          {cat.name}
        </button>
        {hasChildren && cat.children.map((child) => renderSidebarItem(child, level + 1))}
      </div>
    );
  };

  // --- Thu thập phẳng toàn bộ món ăn của các danh mục con (để gom nhóm hiển thị) ---
  const renderCategorySections = (cat: ClientMenuCategoryResponse) => {
    const hasFoods = cat.foods && cat.foods.length > 0;
    const hasChildren = cat.children && cat.children.length > 0;

    return (
      <div key={cat.id} id={`category-${cat.id}`} className="scroll-mt-20 space-y-6">
        {/* Tiêu đề danh mục */}
        <div className="border-b border-hk-border pb-2">
          <h3 className="font-hk-display text-lg font-bold text-hk-text-primary flex items-center gap-2">
            {cat.iconUrl ? (
              <img src={cat.iconUrl} alt={cat.name} className="w-6 h-6 object-contain" />
            ) : (
              <span className="w-1.5 h-6 bg-hk-primary rounded-full"></span>
            )}
            {cat.name}
          </h3>
        </div>

        {/* Danh sách món ăn của danh mục này */}
        {hasFoods ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cat.foods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={(selected: ClientMenuFoodResponse) => setSelectedFoodId(selected.id)}
              />
            ))}
          </div>
        ) : (
          !hasChildren && (
            <p className="font-hk-body text-xs text-hk-text-muted italic">Danh mục hiện chưa có món ăn.</p>
          )
        )}

        {/* Đệ quy hiển thị danh mục con */}
        {hasChildren && cat.children.map((child) => renderCategorySections(child))}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto px-4 py-8">
      {/* 1. SIDEBAR DANH MỤC TRÁI (Sticky) */}
      <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 h-auto lg:h-[calc(100vh-120px)] overflow-y-auto bg-hk-bg-surface border border-hk-border-subtle p-4 rounded-2xl shadow-sm space-y-2">
        <h4 className="font-hk-display text-sm font-bold text-hk-text-primary px-4 pb-2 border-b border-hk-border">
          Danh mục món ăn
        </h4>
        <nav className="flex flex-col gap-1 pt-2">
          {menuTree.map((cat) => renderSidebarItem(cat))}
        </nav>
      </aside>

      {/* 2. GRID DANH SÁCH MÓN ĂN PHẢI */}
      <main className="flex-grow space-y-12 min-w-0">
        {menuTree.map((cat) => renderCategorySections(cat))}
      </main>

      {/* 3. MODAL CHỌN MÓN TÙY BIẾN OPTIONS */}
      {selectedFoodId && (
        <CustomizationModal
          foodId={selectedFoodId}
          onClose={() => setSelectedFoodId(null)}
        />
      )}
    </div>
  );
}
