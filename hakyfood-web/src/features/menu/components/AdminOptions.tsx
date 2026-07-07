import { useState } from 'react';
import {
  useAdminOptionGroups,
  useCreateOptionGroupMutation,
  useUpdateOptionGroupMutation,
  useDeleteOptionGroupMutation,
} from '../api/hooks';
import type { OptionGroupResponse, OptionItemRequest, OptionItemStatus } from '../types';
import { Plus, Edit2, Trash2, ArrowLeft, Trash } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

export function AdminOptions() {
  const { data: optionGroups, isLoading } = useAdminOptionGroups();
  const createMutation = useCreateOptionGroupMutation();
  const updateMutation = useUpdateOptionGroupMutation(''); // ID truyền động trong mutate
  const deleteMutation = useDeleteOptionGroupMutation();

  const [editingId, setEditingId] = useState<string | null>(null);

  // State của form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [minChoices, setMinChoices] = useState(0);
  const [maxChoices, setMaxChoices] = useState(1);
  
  // State quản lý danh sách option items con động
  const [items, setItems] = useState<OptionItemRequest[]>([]);

  // --- Chế độ Sửa ---
  const handleStartEdit = (group: OptionGroupResponse) => {
    setEditingId(group.id);
    setName(group.name);
    setSlug(group.slug || '');
    setDescription(group.description || '');
    setIsRequired(group.isRequired);
    setMinChoices(group.minChoices);
    setMaxChoices(group.maxChoices);
    
    // Map items con sang cấu trúc Request (chứa id cũ nếu có)
    setItems(
      group.optionItems.map((item) => ({
        id: item.id,
        name: item.name,
        additionalPrice: item.additionalPrice,
        displayOrder: item.displayOrder,
        status: item.status,
      }))
    );
  };

  // --- Reset Form ---
  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsRequired(false);
    setMinChoices(0);
    setMaxChoices(1);
    setItems([]);
  };

  // --- Thêm dòng tùy chọn mới ---
  const handleAddItemRow = () => {
    const newItem: OptionItemRequest = {
      name: '',
      additionalPrice: 0,
      displayOrder: items.length,
      status: 'AVAILABLE',
    };
    setItems((prev) => [...prev, newItem]);
  };

  // --- Xóa dòng tùy chọn ---
  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // --- Cập nhật trường trong một dòng ---
  const handleItemRowChange = (index: number, field: keyof OptionItemRequest, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  // --- Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (minChoices > maxChoices) {
      toast.error('Số lựa chọn tối thiểu không được lớn hơn tối đa.');
      return;
    }

    if (isRequired && minChoices < 1) {
      toast.error('Nếu bắt buộc chọn, số lượng tối thiểu phải lớn hơn hoặc bằng 1.');
      return;
    }

    // Kiểm tra tên các item con
    const isAnyItemInvalid = items.some((item) => !item.name.trim());
    if (isAnyItemInvalid) {
      toast.error('Vui lòng điền đầy đủ tên cho các lựa chọn con.');
      return;
    }

    const requestData = {
      name,
      slug,
      description,
      isRequired,
      minChoices,
      maxChoices,
      optionItems: items,
    };

    if (editingId) {
      updateMutation.mutate(requestData, {
        onSuccess: (res) => {
          if (res.success) handleResetForm();
        },
      });
    } else {
      createMutation.mutate(requestData, {
        onSuccess: (res) => {
          if (res.success) handleResetForm();
        },
      });
    }
  };

  // --- Xóa ---
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhóm tùy chọn "${name}" không? (Thao tác này sẽ tự động xóa sạch các tùy chọn con bên trong)`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6 font-hk-body">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hk-border pb-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-hk-bg-surface-raised rounded-xl text-hk-text-secondary cursor-pointer">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-hk-display text-xl font-extrabold text-hk-text-primary">Quản Lý Nhóm Tùy Chọn</h2>
            <p className="font-hk-body text-xs text-hk-text-muted">Xem, thêm mới, sửa đổi cấu hình tùy biến của món ăn (đá, đường, topping...).</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 1. BÊN TRÁI: DANH SÁCH NHÓM TÙY CHỌN */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <h3 className="font-hk-display text-sm font-bold text-hk-text-primary border-l-4 border-hk-primary pl-2">
            Danh sách nhóm hiện có
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-hk-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {optionGroups && optionGroups.length > 0 ? (
                optionGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex flex-col p-4 border border-hk-border-subtle bg-hk-bg-surface rounded-2xl shadow-sm hover:shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-hk-display text-xs font-bold text-hk-text-primary mr-2 flex items-center gap-2">
                          {group.name}
                          {group.isRequired && (
                            <span className="text-[8px] bg-hk-primary-subtle text-hk-primary font-bold px-1.5 py-0.5 rounded">Bắt buộc</span>
                          )}
                        </h4>
                        <p className="text-[10px] text-hk-text-muted mt-1">{group.description || 'Không có mô tả.'}</p>
                        <span className="inline-block text-[9px] font-semibold font-mono text-hk-text-secondary bg-hk-bg-surface-sunken px-1.5 py-0.5 rounded border border-hk-border mt-1.5">
                          slug: {group.slug}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(group)}
                          className="p-1.5 hover:text-hk-primary hover:bg-hk-primary-subtle/30 rounded-lg cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id, group.name)}
                          className="p-1.5 hover:text-hk-status-error hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Danh sách items con tóm tắt */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {group.optionItems.map((item) => (
                        <span key={item.id} className="text-[9px] bg-hk-bg-surface-sunken text-hk-text-secondary px-2 py-0.5 rounded-lg border border-hk-border">
                          {item.name} {item.additionalPrice > 0 ? `(+${formatPrice(item.additionalPrice)})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="font-hk-body text-xs text-hk-text-muted italic text-center py-12">Chưa có nhóm nào được tạo.</p>
              )}
            </div>
          )}
        </div>

        {/* 2. BÊN PHẢI: FORM CREATE / EDIT */}
        <div className="w-full lg:w-1/2">
          <div className="bg-hk-bg-surface border border-hk-border-subtle rounded-2xl p-6 shadow-sm">
            <h3 className="font-hk-display text-sm font-bold text-hk-text-primary border-b border-hk-border pb-3 mb-4">
              {editingId ? 'Chỉnh sửa nhóm' : 'Thêm nhóm tùy chọn mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên nhóm */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Tên nhóm tùy chọn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lượng đá, Topping..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                />
              </div>

              {/* Slug định danh */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Slug định danh (Slug)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: ice-level, toppings"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả công dụng của nhóm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                />
              </div>

              {/* Bắt buộc & Số lượng lựa chọn */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-hk-primary focus:ring-hk-primary"
                  />
                  <label htmlFor="isRequired" className="text-xs font-bold text-hk-text-secondary cursor-pointer">Bắt buộc</label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">Chọn tối thiểu</label>
                  <input
                    type="number"
                    min={0}
                    value={minChoices}
                    onChange={(e) => setMinChoices(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-1.5 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">Chọn tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={maxChoices}
                    onChange={(e) => setMaxChoices(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-1.5 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* DYNAMIC NESTED FORM (Danh sách các option item con động) */}
              <div className="border border-hk-border rounded-2xl p-4 bg-hk-bg-surface-sunken space-y-3">
                <div className="flex justify-between items-center border-b border-hk-border pb-2">
                  <span className="font-hk-display text-xs font-bold text-hk-text-primary">Các lựa chọn chi tiết</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    + Thêm lựa chọn
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="font-hk-body text-[10px] text-hk-text-muted italic text-center py-6">Chưa có tùy chọn chi tiết nào. Bấm nút Thêm để tạo.</p>
                ) : (
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center bg-hk-bg-surface border border-hk-border rounded-xl p-2">
                        {/* Tên item con */}
                        <div className="flex-grow">
                          <input
                            type="text"
                            required
                            placeholder="Tên (e.g. 50% Đá)"
                            value={item.name}
                            onChange={(e) => handleItemRowChange(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-hk-border rounded-lg text-[10px] focus:border-hk-primary focus:outline-none"
                          />
                        </div>

                        {/* Giá phụ thu */}
                        <div className="w-20">
                          <input
                            type="number"
                            min={0}
                            placeholder="Giá"
                            value={item.additionalPrice}
                            onChange={(e) => handleItemRowChange(index, 'additionalPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-hk-border rounded-lg text-[10px] focus:border-hk-primary focus:outline-none"
                          />
                        </div>

                        {/* Trạng thái */}
                        <div className="w-24">
                          <select
                            value={item.status || 'AVAILABLE'}
                            onChange={(e) => handleItemRowChange(index, 'status', e.target.value as OptionItemStatus)}
                            className="w-full px-1 py-1 border border-hk-border rounded-lg text-[10px] focus:border-hk-primary focus:outline-none"
                          >
                            <option value="AVAILABLE">Bán</option>
                            <option value="OUT_OF_STOCK">Hết</option>
                          </select>
                        </div>

                        {/* Nút xóa row */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          className="p-1 text-hk-status-error hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus size={14} />
                  {editingId ? 'Lưu cập nhật' : 'Thêm mới'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2.5 bg-hk-bg-surface-sunken hover:bg-hk-bg-surface-raised border border-hk-border text-hk-text-secondary text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
