import { useState } from 'react';
import {
  useAdminFoods,
  useAdminCategories,
  useAdminOptionGroups,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useDeleteFoodMutation,
} from '../api/hooks';
import type { FoodResponse, FoodStatus } from '../types';
import { Plus, Edit2, Trash2, ArrowLeft, Filter, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

export function AdminFoods() {
  const { data: foods, isLoading: isFoodsLoading } = useAdminFoods();
  const { data: categories } = useAdminCategories();
  const { data: optionGroups } = useAdminOptionGroups();

  const createMutation = useCreateFoodMutation();
  const updateMutation = useUpdateFoodMutation(''); // ID truyền động trong mutate
  const deleteMutation = useDeleteFoodMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State các trường trong Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [status, setStatus] = useState<FoodStatus>('AVAILABLE');
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>([]);
  
  // State quản lý liên kết ID Category và OptionGroup
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedOptionGroupIds, setSelectedOptionGroupIds] = useState<string[]>([]);

  // State bộ lọc (Filter)
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // --- Mở Modal Tạo mới ---
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setBasePrice(0);
    setStatus('AVAILABLE');
    setDetailImageUrls([]);
    setSelectedCategoryIds([]);
    setSelectedOptionGroupIds([]);
    setIsModalOpen(true);
  };

  // --- Mở Modal Chỉnh sửa ---
  const handleOpenEditModal = (food: FoodResponse) => {
    setEditingId(food.id);
    setName(food.name);
    setSlug(food.slug);
    setDescription(food.description || '');
    setImageUrl(food.imageUrl || '');
    setBasePrice(food.basePrice);
    setStatus(food.status);
    setDetailImageUrls(food.detailImageUrls || []);
    setSelectedCategoryIds(food.categories.map((c) => c.id));
    setSelectedOptionGroupIds(food.optionGroups.map((og) => og.id));
    setIsModalOpen(true);
  };

  // --- Toggle check category ---
  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // --- Toggle check option group ---
  const handleToggleOptionGroup = (ogId: string) => {
    setSelectedOptionGroupIds((prev) =>
      prev.includes(ogId) ? prev.filter((id) => id !== ogId) : [...prev, ogId]
    );
  };

  // --- Submit Form ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (basePrice < 0) {
      toast.error('Giá gốc không được nhỏ hơn 0.');
      return;
    }

    const requestData = {
      name,
      slug,
      description,
      imageUrl,
      detailImageUrls,
      basePrice,
      status,
      categoryIds: selectedCategoryIds,
      optionGroupIds: selectedOptionGroupIds,
    };

    if (editingId) {
      updateMutation.mutate(requestData, {
        onSuccess: (res) => {
          if (res.success) setIsModalOpen(false);
        },
      });
    } else {
      createMutation.mutate(requestData, {
        onSuccess: (res) => {
          if (res.success) setIsModalOpen(false);
        },
      });
    }
  };

  // --- Xóa món ăn ---
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa món ăn "${name}" không?`)) {
      deleteMutation.mutate(id);
    }
  };

  // --- Lọc món ăn hiển thị ---
  const filteredFoods = foods ? foods.filter((food) => {
    const matchCategory = filterCategoryId === '' || food.categories.some((c) => c.id === filterCategoryId);
    const matchStatus = filterStatus === '' || food.status === filterStatus;
    return matchCategory && matchStatus;
  }) : [];

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
            <h2 className="font-hk-display text-xl font-extrabold text-hk-text-primary">Quản Lý Món Ăn</h2>
            <p className="font-hk-body text-xs text-hk-text-muted">Thêm mới, sửa đổi thông tin và gán danh mục, tùy biến cho món ăn.</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={14} />
          Thêm món mới
        </button>
      </div>

      {/* Bộ lọc (Filter Bar) */}
      <div className="bg-hk-bg-surface border border-hk-border-subtle p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-hk-text-secondary">
          <Filter size={14} />
          Bộ lọc:
        </div>

        {/* Lọc danh mục */}
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="px-3 py-1.5 border border-hk-border rounded-xl text-xs bg-hk-bg-surface focus:outline-none"
        >
          <option value="">-- Tất cả danh mục --</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Lọc trạng thái */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-hk-border rounded-xl text-xs bg-hk-bg-surface focus:outline-none"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="AVAILABLE">Đang bán</option>
          <option value="OUT_OF_STOCK">Tạm hết</option>
          <option value="INACTIVE">Tắt hẳn</option>
        </select>
      </div>

      {/* Bảng danh sách món ăn */}
      {isFoodsLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-hk-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-hk-bg-surface border border-hk-border-subtle rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hk-border bg-hk-bg-surface-sunken">
                <th className="p-4 text-xs font-bold text-hk-text-secondary w-16">Hình ảnh</th>
                <th className="p-4 text-xs font-bold text-hk-text-secondary">Tên món ăn</th>
                <th className="p-4 text-xs font-bold text-hk-text-secondary">Giá gốc</th>
                <th className="p-4 text-xs font-bold text-hk-text-secondary">Danh mục</th>
                <th className="p-4 text-xs font-bold text-hk-text-secondary">Tùy biến</th>
                <th className="p-4 text-xs font-bold text-hk-text-secondary">Trạng thái</th>
                <th className="p-4 text-xs font-bold text-hk-text-secondary w-20">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hk-border-subtle">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-hk-bg-surface-raised transition-all">
                    {/* Ảnh */}
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-xl bg-hk-bg-surface-sunken overflow-hidden border border-hk-border">
                        {food.imageUrl ? (
                          <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-[8px] text-hk-text-muted text-center font-bold">Không ảnh</div>
                        )}
                      </div>
                    </td>

                    {/* Tên & Slug */}
                    <td className="p-4">
                      <div className="font-hk-display text-xs font-bold text-hk-text-primary">{food.name}</div>
                      <div className="text-[10px] text-hk-text-muted mt-0.5">{food.slug}</div>
                    </td>

                    {/* Giá gốc */}
                    <td className="p-4 font-hk-display text-xs font-bold text-hk-primary">
                      {formatPrice(food.basePrice)}
                    </td>

                    {/* Các danh mục liên kết */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {food.categories.map((c) => (
                          <span key={c.id} className="text-[9px] font-bold bg-hk-primary-subtle text-hk-primary px-2 py-0.5 rounded">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Các Option Groups liên kết */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {food.optionGroups.map((og) => (
                          <span key={og.id} className="text-[9px] font-semibold bg-hk-bg-surface-sunken border border-hk-border text-hk-text-secondary px-2 py-0.5 rounded">
                            {og.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        food.status === 'AVAILABLE'
                          ? 'bg-green-50 text-green-600'
                          : food.status === 'OUT_OF_STOCK'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-hk-status-error'
                      }`}>
                        {food.status === 'AVAILABLE' ? 'Đang bán' : food.status === 'OUT_OF_STOCK' ? 'Tạm hết' : 'Tạm ẩn'}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(food)}
                        className="p-1.5 hover:text-hk-primary hover:bg-hk-primary-subtle/30 rounded-lg cursor-pointer"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(food.id, food.name)}
                        className="p-1.5 hover:text-hk-status-error hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-hk-text-muted italic">Không tìm thấy món ăn nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL FORM CREATE / EDIT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-hk-bg-surface w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-6 border-b border-hk-border flex justify-between items-center bg-hk-bg-surface-raised">
              <h3 className="font-hk-display text-sm font-bold text-hk-text-primary">
                {editingId ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-hk-text-secondary hover:text-hk-primary cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Nội dung Modal Form (Scrollable) */}
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              {/* Tên & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">Tên món ăn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Cơm rang Hawaii"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
                    }}
                    className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">Đường dẫn thân thiện (Slug)</label>
                  <input
                    type="text"
                    placeholder="com-rang-hawaii"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Mô tả món ăn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả các thành phần món ăn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                />
              </div>

              {/* URL ảnh & Giá gốc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">URL hình ảnh</label>
                  <input
                    type="text"
                    placeholder="https://example.com/food.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-hk-text-secondary mb-1">Giá bán cơ bản (VND) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="50000"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                  />
                </div>
              </div>
              {/* Trạng thái */}
              <div>
                <label className="block text-xs font-bold text-hk-text-secondary mb-1">Trạng thái bán</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FoodStatus)}
                  className="w-full px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none"
                >
                  <option value="AVAILABLE">Đang bán (AVAILABLE)</option>
                  <option value="OUT_OF_STOCK">Tạm hết hàng (OUT_OF_STOCK)</option>
                  <option value="INACTIVE">Tạm ẩn hiển thị (INACTIVE)</option>
                </select>
              </div>

              {/* Danh sách ảnh phụ chi tiết */}
              <div className="border border-hk-border rounded-2xl p-4 bg-hk-bg-surface-sunken flex flex-col gap-2">
                <span className="block text-xs font-bold text-hk-text-primary mb-1">Ảnh phụ chi tiết (slide hiển thị)</span>
                
                {/* Form thêm ảnh phụ */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="new-detail-image-input"
                    placeholder="https://example.com/detail-image.jpg"
                    className="flex-1 px-4 py-2 border border-hk-border rounded-xl text-xs focus:border-hk-primary focus:outline-none bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const val = input.value.trim();
                        if (val) {
                          setDetailImageUrls((prev) => [...prev, val]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new-detail-image-input') as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val) {
                        setDetailImageUrls((prev) => [...prev, val]);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-hk-primary text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-hk-primary-hover active:scale-95 transition-all shrink-0"
                  >
                    Thêm
                  </button>
                </div>

                {/* Danh sách ảnh phụ hiện tại */}
                {detailImageUrls.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto mt-2">
                    {detailImageUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-hk-bg-surface rounded-xl border border-hk-border-subtle">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <img src={url} alt={`detail-${idx}`} className="w-8 h-8 object-cover rounded" />
                          <span className="text-[10px] text-hk-text-secondary truncate flex-1">{url}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Nút di chuyển lên */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              setDetailImageUrls((prev) => {
                                const list = [...prev];
                                const temp = list[idx];
                                list[idx] = list[idx - 1];
                                list[idx - 1] = temp;
                                return list;
                              });
                            }}
                            className="p-1 hover:bg-hk-bg-surface-sunken text-hk-text-secondary disabled:opacity-30 rounded cursor-pointer text-xs"
                          >
                            ▲
                          </button>
                          {/* Nút di chuyển xuống */}
                          <button
                            type="button"
                            disabled={idx === detailImageUrls.length - 1}
                            onClick={() => {
                              setDetailImageUrls((prev) => {
                                const list = [...prev];
                                const temp = list[idx];
                                list[idx] = list[idx + 1];
                                list[idx + 1] = temp;
                                return list;
                              });
                            }}
                            className="p-1 hover:bg-hk-bg-surface-sunken text-hk-text-secondary disabled:opacity-30 rounded cursor-pointer text-xs"
                          >
                            ▼
                          </button>
                          {/* Nút xóa */}
                          <button
                            type="button"
                            onClick={() => {
                              setDetailImageUrls((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-hk-status-error hover:bg-red-50 rounded cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-hk-body text-[10px] text-hk-text-muted italic">Chưa có ảnh phụ nào.</p>
                )}
              </div>

              {/* Liên kết danh mục (Grid checkbox) */}
              <div className="border border-hk-border rounded-2xl p-4 bg-hk-bg-surface-sunken">
                <span className="block text-xs font-bold text-hk-text-primary mb-2">Gán danh mục món ăn (chọn nhiều)</span>
                {categories && categories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 text-xs text-hk-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={() => handleToggleCategory(cat.id)}
                          className="w-4 h-4 rounded text-hk-primary focus:ring-hk-primary"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="font-hk-body text-[10px] text-hk-text-muted italic">Chưa có danh mục nào để chọn.</p>
                )}
              </div>

              {/* Liên kết Option Groups (Grid checkbox) */}
              <div className="border border-hk-border rounded-2xl p-4 bg-hk-bg-surface-sunken">
                <span className="block text-xs font-bold text-hk-text-primary mb-2">Gán nhóm tùy chọn (đường/đá/topping...)</span>
                {optionGroups && optionGroups.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {optionGroups.map((og) => (
                      <label key={og.id} className="flex items-center gap-2 text-xs text-hk-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOptionGroupIds.includes(og.id)}
                          onChange={() => handleToggleOptionGroup(og.id)}
                          className="w-4 h-4 rounded text-hk-primary focus:ring-hk-primary"
                        />
                        {og.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="font-hk-body text-[10px] text-hk-text-muted italic">Chưa có nhóm tùy chọn nào để chọn.</p>
                )}
              </div>

              {/* Footer Modal Action */}
              <div className="border-t border-hk-border pt-4 flex justify-end gap-3 bg-hk-bg-surface">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-hk-bg-surface-sunken hover:bg-hk-bg-surface-raised border border-hk-border text-hk-text-secondary text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus size={14} />
                  {editingId ? 'Lưu cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
