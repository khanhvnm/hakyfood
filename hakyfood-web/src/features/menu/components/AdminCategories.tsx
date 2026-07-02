import { useState } from 'react';
import {
  useAdminCategoryTree,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../api/hooks';
import type { CategoryResponse, CategoryStatus } from '../types';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';

// Utility đơn giản chuyển đổi sang slug
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function AdminCategories() {
  const { data: categoryTree, isLoading } = useAdminCategoryTree();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation(''); // ID truyền động trong mutate
  const deleteMutation = useDeleteCategoryMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State của form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState<CategoryStatus>('ACTIVE');
  const [parentId, setParentId] = useState<string | null>(null);

  // --- Chế độ Sửa ---
  const handleStartEdit = (cat: CategoryResponse) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIconUrl(cat.iconUrl || '');
    setDisplayOrder(cat.displayOrder);
    setStatus(cat.status);
    setParentId(cat.parentId || null);
  };

  // --- Reset Form ---
  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setIconUrl('');
    setDisplayOrder(0);
    setStatus('ACTIVE');
    setParentId(null);
  };

  // --- Xử lý gõ Tên để Auto-slug ---
  const handleNameChange = (val: string) => {
    setName(val);
    // Nếu ở chế độ tạo mới hoặc chưa tự ý sửa slug, tự động đồng bộ slug
    setSlug(generateSlug(val));
  };

  // --- Submit Form ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = {
      name,
      slug: slug || generateSlug(name),
      iconUrl,
      displayOrder,
      status,
      parentId: parentId || null,
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

  // --- Xử lý Xóa ---
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không? (Các danh mục con sẽ tự chuyển về cấp gốc)`)) {
      deleteMutation.mutate(id);
    }
  };

  // --- Flatten danh mục đệ quy để đưa vào Dropdown chọn Danh mục cha ---
  const flattenCategories = (list?: CategoryResponse[], level = 0): Array<{ id: string; name: string; level: number }> => {
    if (!list) return [];
    let result: Array<{ id: string; name: string; level: number }> = [];
    list.forEach((cat) => {
      // Loại trừ danh mục hiện đang chỉnh sửa và các con của nó để tránh vòng lặp đệ quy
      if (cat.id !== editingId) {
        result.push({ id: cat.id, name: cat.name, level });
        if (cat.children) {
          result = result.concat(flattenCategories(cat.children, level + 1));
        }
      }
    });
    return result;
  };

  const parentOptions = flattenCategories(categoryTree);

  // --- Render Cây danh mục đệ quy ---
  const renderCategoryTreeNodes = (list?: CategoryResponse[], level = 0) => {
    if (!list || list.length === 0) return null;

    return (
      <div className="flex flex-col gap-2">
        {list.map((cat) => {
          const hasChildren = cat.children && cat.children.length > 0;
          return (
            <div key={cat.id} className="flex flex-col gap-1">
              <div
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                className={`flex items-center justify-between p-3 rounded-xl border border-hk-border-subtle bg-hk-bg-surface hover:bg-hk-bg-surface-raised transition-all`}
              >
                <div className="flex items-center gap-2">
                  {cat.iconUrl && (
                    <img src={cat.iconUrl} alt={cat.name} className="w-5 h-5 object-contain" />
                  )}
                  <span className="font-hk-display text-xs font-bold text-hk-text-primary">{cat.name}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    cat.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-hk-status-error'
                  }`}>
                    {cat.status === 'ACTIVE' ? 'Hoạt động' : 'Tắt'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 hover:text-hk-primary hover:bg-hk-primary-subtle/30 rounded-lg cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 hover:text-hk-status-error hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {hasChildren && renderCategoryTreeNodes(cat.children, level + 1)}
            </div>
          );
        })}
      </div>
    );
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
            <h2 className="font-hk-display text-xl font-extrabold text-hk-text-primary">Quản Lý Danh Mục</h2>
            <p className="font-hk-body text-xs text-hk-text-muted">Xem, thêm mới, sửa và cấu trúc lại phân cấp danh mục.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 1. BÊN TRÁI: HIỂN THỊ CÂY DANH MỤC */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <h3 className="font-hk-display text-sm font-bold text-hk-text-primary border-l-4 border-hk-primary pl-2">
            Cấu trúc danh mục hiện có
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-hk-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-1">
              {categoryTree && categoryTree.length > 0 ? (
                renderCategoryTreeNodes(categoryTree)
              ) : (
                <p className="font-hk-body text-xs text-hk-text-muted italic text-center py-12">Chưa có danh mục nào được tạo.</p>
              )}
            </div>
          )}
        </div>

        {/* 2. BÊN PHẢI: FORM CREATE / EDIT */}
        <div className="w-full lg:w-1/2">
          <div className="bg-hk-bg-surface border border-hk-border-subtle rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-hk-display text-sm font-bold text-hk-text-primary border-b border-hk-border pb-3 mb-4">
              {editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên danh mục */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cơm Rang"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                />
              </div>

              {/* Slug Preview */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Đường dẫn thân thiện (Slug)</label>
                <input
                  type="text"
                  placeholder="com-rang"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs bg-hk-bg-surface-sunken focus:border-hk-primary focus:outline-none"
                />
                <span className="text-[10px] text-hk-text-muted mt-1 block">Tự động chuyển: {generateSlug(name)}</span>
              </div>

              {/* Danh mục cha */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Danh mục cha</label>
                <select
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                >
                  <option value="">-- Cấp gốc (Root) --</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {'\u00A0\u00A0'.repeat(opt.level) + '├─ ' + opt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL Icon */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">URL Icon</label>
                <input
                  type="text"
                  placeholder="https://example.com/icon.png"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                />
              </div>

              {/* Display order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CategoryStatus)}
                    className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                  </select>
                </div>
              </div>

              {/* Nút hành động */}
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
