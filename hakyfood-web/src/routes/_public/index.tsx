import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useCartStore } from '@/features/cart/store/useCartStore';
import './home.css';

export const Route = createFileRoute('/_public/')({
  component: HomeComponent,
});

interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  icon: string;
  cat: 'com' | 'mi' | 'nhauphi' | 'douong';
  tag?: {
    type: 'fire' | 'star';
    text: string;
  };
}

const menuItems: MenuItem[] = [
  // Cơm
  {
    id: 'com-rang-haky',
    name: 'Cơm Rang Haky',
    desc: 'Mực, tôm, rau củ quả, sốt Haky đặc trưng. Cơm không khô như các loại cơm rang khác.',
    price: 70000,
    icon: '🍚',
    cat: 'com',
    tag: { type: 'fire', text: '🔥 Hot' },
  },
  {
    id: 'com-rang-hoang-gia',
    name: 'Cơm Rang Hoàng Gia',
    desc: 'Lạp xưởng, xúc xích, pate, rau củ quả. Vị đậm đà, ăn no bụng.',
    price: 65000,
    icon: '🍛',
    cat: 'com',
    tag: { type: 'star', text: '⭐ Đặc biệt' },
  },
  {
    id: 'com-ga-nuong-mat-ong',
    name: 'Cơm Gà Nướng Mật Ong',
    desc: 'Chỉ bán Thứ 2 – Thứ 4 – Thứ 6. Gà nướng vàng óng, mật ong thấm đều.',
    price: 70000,
    icon: '🍱',
    cat: 'com',
  },
  // Mì
  {
    id: 'mi-xao-hoang-kim',
    name: 'Mì Xào Hoàng Kim',
    desc: 'Bò, Trứng non, rau cải, carot, hành tây, nấm hương, Sốt Haky.',
    price: 75000,
    icon: '🍝',
    cat: 'mi',
    tag: { type: 'star', text: '⭐ Đặc biệt' },
  },
  {
    id: 'mien-xao-hai-san',
    name: 'Miến Xào Hải Sản',
    desc: 'Miến HQ, mực, tôm, trứng, nấm hương, giá đỗ, sốt Thái chua ngọt.',
    price: 85000,
    icon: '🍲',
    cat: 'mi',
  },
  {
    id: 'mi-y-carbonara',
    name: 'Mì Ý Carbonara',
    desc: 'Thịt xông khói, sốt kem béo ngậy, nấm, vị phương Tây giữa lòng Hà Nội.',
    price: 75000,
    icon: '🍝',
    cat: 'mi',
  },
  // Nhậu & Ăn vặt
  {
    id: 'set-chan-gio-han-quoc',
    name: 'Set Chân Giò Hâm Hàn Quốc',
    desc: '2-3 người ăn. Chân giò hâm mềm kiểu Hàn, kèm kim chi và sốt đặc biệt.',
    price: 300000,
    icon: '🍗',
    cat: 'nhauphi',
    tag: { type: 'fire', text: '🔥 Hot' },
  },
  {
    id: 'ga-chien-gion-lac-pho-mai',
    name: 'Gà Chiên Giòn Lắc Phô Mai',
    desc: 'Gà chiên giòn tan, lắc phô mai vàng ươm, ăn một lần là ghiền.',
    price: 65000,
    icon: '🍟',
    cat: 'nhauphi',
  },
  {
    id: 'sun-ga-hoang-kim',
    name: 'Sụn Gà Hoàng Kim',
    desc: 'Kèm sốt Trứng Muối đặc biệt. Sụn gà giòn dai, béo bùi, ăn không ngừng được.',
    price: 90000,
    icon: '🐔',
    cat: 'nhauphi',
  },
  // Đồ uống
  {
    id: 'tra-sua-dam-vi-truyen-thong',
    name: 'Trà Sữa Đậm Vị Truyền Thống',
    desc: 'Kèm Trân Châu Caramel, Pudding Trứng, Cacao. Đậm đà, ngọt dịu.',
    price: 35000,
    icon: '🧋',
    cat: 'douong',
  },
  {
    id: 'tra-xoai-dao',
    name: 'Trà Xoài Đào',
    desc: 'Hoa quả tươi, vị ngọt thanh mát. Kết hợp xoài và đào độc đáo.',
    price: 35000,
    icon: '🥭',
    cat: 'douong',
  },
  {
    id: 'sam-dua-sua-thach-cu-nang',
    name: 'Sâm Dứa Sữa Thạch Củ Năng',
    desc: 'Thanh mát, lạ miệng. Thạch củ năng giòn, vị dứa ngọt nhẹ.',
    price: 35000,
    icon: '🍹',
    cat: 'douong',
  },
];

function HomeComponent() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const addToCart = useCartStore((state) => state.addToCart);

  // Scroll reveal observer
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, [activeCategory]);

  const handleAddToCart = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      foodId: item.id,
      name: item.name,
      basePrice: item.price,
      totalUnitPrice: item.price,
      quantity: 1,
      selectedOptions: [],
    });

    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  const handleComboAlert = (comboName: string) => {
    const phone = '0347806464';
    alert(
      `Để đặt Combo ${comboName}, vui lòng gọi: ${phone}\nHoặc nhắn tin qua Zalo/Facebook của HakyFood!`
    );
  };

  const filteredMenuItems = menuItems.filter(
    (item) => activeCategory === 'all' || item.cat === activeCategory
  );

  return (
    <div className="font-hk-body">
      {/* ============ HERO ============ */}
      <section className="hero noise">
        <div className="hero-bg-pattern"></div>
        <div className="hero-grid-lines"></div>
        <div className="max-w-[1240px] mx-auto w-full px-6">
          <div className="hero-content">
            <div>
              <div className="hero-badge">
                <span>🌙</span> Ship Đồ Ăn Đêm Hà Nội
              </div>
              <h1 className="hero-title">
                Đói lúc <em>nửa đêm</em>?
                <span>HakyFood có mặt!</span>
              </h1>
              <p className="hero-desc">
                Hơn 60+ món ngon từ cơm rang, mì xào, đến đồ nhậu nhâm nhi — giao tận nơi từ 18:30 đến 3:00 sáng.
              </p>
              <div className="hero-actions">
                <a href="tel:0347806464" className="btn-primary">
                  📞 Gọi đặt ngay
                </a>
                <a href="#menu" className="btn-outline">
                  Xem thực đơn →
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-num">60+</div>
                  <div className="stat-label">Món ngon</div>
                </div>
                <div className="stat">
                  <div className="stat-num">18:30</div>
                  <div className="stat-label">Mở cửa</div>
                </div>
                <div className="stat">
                  <div className="stat-num">3:00</div>
                  <div className="stat-label">Đóng cửa</div>
                </div>
                <div className="stat">
                  <div className="stat-num">⚡ Nhanh</div>
                  <div className="stat-label">Giao hàng</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-open-badge">
                <div className="open-dot"></div>
                Đang mở cửa
              </div>
              <div className="hero-img-main">
                <div className="hero-img-placeholder">🍜</div>
              </div>
              <div className="hero-float-card card-1">
                <div className="float-icon">🔥</div>
                <div className="float-text">
                  <strong>Mì Xào Hoàng Kim</strong>
                  <span>Best Seller hôm nay</span>
                </div>
              </div>
              <div className="hero-float-card card-2">
                <div className="float-icon">⭐</div>
                <div className="float-text">
                  <strong>Xôi Mặn Sài Gòn</strong>
                  <span>Thứ 6 – Chủ nhật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Cơm Rang Haky
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Mì Trộn Hồ Lô
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Gà Chiên Giòn Lắc Phô Mai
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Xôi Mặn Sài Gòn
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Miến Xào Hải Sản
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Tré Trộn Sài Gòn
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Set Chân Giò Hàn Quốc
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Combo Street Food
          </div>
          {/* repeat for seamless loop */}
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Cơm Rang Haky
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Mì Trộn Hồ Lô
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Gà Chiên Giòn Lắc Phô Mai
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Xôi Mặn Sài Gòn
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Miến Xào Hải Sản
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Tré Trộn Sài Gòn
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Set Chân Giò Hàn Quốc
          </div>
          <div className="ticker-item">
            <span className="ticker-dot">★</span> Combo Street Food
          </div>
        </div>
      </div>

      {/* ============ MENU ============ */}
      <section className="section menu-section" id="menu">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="section-header reveal">
            <div className="section-tag">
              <span className="tag tag--fire">🍽 Thực đơn</span>
            </div>
            <h2 className="section-title">
              Món ngon <span>mọi lúc</span>
            </h2>
            <div className="section-divider"></div>
            <p className="section-sub">
              Từ cơm rang đến mì xào, từ đồ nhậu đến trà sữa — HakyFood phục vụ tất cả
            </p>
          </div>

          <div className="cat-tabs reveal">
            <button
              className={`cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              🍽 Tất cả
            </button>
            <button
              className={`cat-tab ${activeCategory === 'com' ? 'active' : ''}`}
              onClick={() => setActiveCategory('com')}
            >
              🍚 Cơm
            </button>
            <button
              className={`cat-tab ${activeCategory === 'mi' ? 'active' : ''}`}
              onClick={() => setActiveCategory('mi')}
            >
              🍜 Mì & Miến
            </button>
            <button
              className={`cat-tab ${activeCategory === 'nhauphi' ? 'active' : ''}`}
              onClick={() => setActiveCategory('nhauphi')}
            >
              🍗 Nhậu & Ăn vặt
            </button>
            <button
              className={`cat-tab ${activeCategory === 'douong' ? 'active' : ''}`}
              onClick={() => setActiveCategory('douong')}
            >
              🧋 Đồ uống
            </button>
          </div>

          <div className="menu-grid" id="menuGrid">
            {filteredMenuItems.map((item, idx) => (
              <div
                key={item.id}
                className="menu-card reveal"
                style={{ animationDelay: `${(idx % 3) * 0.1}s` }}
              >
                <div className="menu-card-img">
                  {item.icon}
                  {item.tag && (
                    <div className="menu-card-tag">
                      <span
                        className={`tag ${
                          item.tag.type === 'fire' ? 'tag--fire' : 'tag--star'
                        }`}
                      >
                        {item.tag.text}
                      </span>
                    </div>
                  )}
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-name">{item.name}</div>
                  <div className="menu-card-desc">{item.desc}</div>
                  <div className="menu-card-footer">
                    <div className="menu-card-price">
                      {item.price.toLocaleString('vi-VN')} <span>₫</span>
                    </div>
                    <button
                      className="add-btn"
                      style={
                        addedItems[item.id]
                          ? { backgroundColor: '#16A34A', color: '#fff' }
                          : undefined
                      }
                      onClick={(e) => handleAddToCart(item, e)}
                      title="Thêm vào giỏ"
                    >
                      {addedItems[item.id] ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SPECIAL DAILY ============ */}
      <section className="section special-section noise" id="dac-biet">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="special-grid">
            <div className="special-text">
              <div style={{ marginBottom: '16px' }}>
                <span className="tag tag--star">⭐ Đặc biệt theo ngày</span>
              </div>
              <h2 className="special-title">
                Lịch săn món<br />
                <span>cùng HakyFood</span>
              </h2>
              <p className="special-desc">
                Mỗi ngày một món đặc biệt. Don't bỏ lỡ những món chỉ xuất hiện vài ngày trong tuần — hương vị khác biệt, cảm giác chờ đợi thật đáng!
              </p>
              <div className="schedule-cards">
                <div className="schedule-card">
                  <div className="schedule-days">Thứ 2 – 4 – 6</div>
                  <div className="schedule-dish">🍗 Cơm Gà Nướng Mật Ong</div>
                  <div className="schedule-arrow">→</div>
                </div>
                <div className="schedule-card">
                  <div className="schedule-days">Thứ 3 – 5 – 7</div>
                  <div className="schedule-dish">🥩 Thịt Nướng Hàn Quốc</div>
                  <div className="schedule-arrow">→</div>
                </div>
                <div className="schedule-card">
                  <div className="schedule-days">Thứ 6 – 7 – CN</div>
                  <div className="schedule-dish">🍚 Xôi Mặn Sài Gòn & Tré Trộn</div>
                  <div className="schedule-arrow">→</div>
                </div>
              </div>
            </div>
            <div className="special-visual">
              <div className="special-card featured">
                <div className="special-card-icon">🌟</div>
                <div className="special-card-name">Xôi Mặn Sài Gòn</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '4px 0' }}>
                  Lạp xưởng Kiên Giang • Chả nướng • Trứng cút
                </div>
                <div className="special-card-price">65.000 ₫</div>
              </div>
              <div className="special-card">
                <div className="special-card-icon">🥗</div>
                <div className="special-card-name">Tré Trộn Sài Gòn</div>
                <div className="special-card-price">85.000 ₫</div>
              </div>
              <div className="special-card">
                <div className="special-card-icon">🥩</div>
                <div className="special-card-name">Thịt Nướng HQ</div>
                <div className="special-card-price">Theo set</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMBO ============ */}
      <section className="section" id="combo">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="section-header reveal">
            <div className="section-tag">
              <span className="tag tag--new">🎯 Tiết kiệm</span>
            </div>
            <h2 className="section-title">
              Combo <span>Street Food</span>
            </h2>
            <div className="section-divider"></div>
            <p className="section-sub">
              Kết hợp thông minh — no bụng, vui miệng, giá hợp lý
            </p>
          </div>
          <div className="combo-grid">
            <div className="combo-card c1 reveal">
              <div className="combo-header">
                <div className="combo-label">Combo Yên Lãng</div>
                <div className="combo-name">Yên Lãng</div>
                <div className="combo-price-big">120K</div>
              </div>
              <div className="combo-body">
                <div className="combo-items">
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Mì Spaghetti Sốt Bò Băm
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Nem Chua Rán
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Sâm Dứa Sữa Thạch Củ Năng
                  </div>
                </div>
                <button className="combo-order-btn" onClick={() => handleComboAlert('Yên Lãng')}>
                  Đặt combo này →
                </button>
              </div>
            </div>
            <div className="combo-card c2 reveal" style={{ animationDelay: '0.1s' }}>
              <div className="combo-header">
                <div className="combo-label">Combo Thái Thịnh</div>
                <div className="combo-name">Thái Thịnh</div>
                <div className="combo-price-big">150K</div>
              </div>
              <div className="combo-body">
                <div className="combo-items">
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Cơm Rang Đông Phương
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Gà Viên Chiên Lắc Phô Mai
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Sữa Chua Xoài
                  </div>
                </div>
                <button className="combo-order-btn" onClick={() => handleComboAlert('Thái Thịnh')}>
                  Đặt combo này →
                </button>
              </div>
            </div>
            <div className="combo-card c3 reveal" style={{ animationDelay: '0.2s' }}>
              <div className="combo-header">
                <div className="combo-label">Combo Khương Trung</div>
                <div className="combo-name">Khương Trung</div>
                <div className="combo-price-big">155K</div>
              </div>
              <div className="combo-body">
                <div className="combo-items">
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Cơm Gà Xào Xả Ớt
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Sụn Gà Hoàng Kim
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Trà Chanh Haky
                  </div>
                </div>
                <button className="combo-order-btn" onClick={() => handleComboAlert('Khương Trung')}>
                  Đặt combo này →
                </button>
              </div>
            </div>
            <div className="combo-card c4 reveal" style={{ animationDelay: '0.3s' }}>
              <div className="combo-header">
                <div className="combo-label">Combo Thanh Xuân</div>
                <div className="combo-name">Thanh Xuân</div>
                <div className="combo-price-big">160K</div>
              </div>
              <div className="combo-body">
                <div className="combo-items">
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Cơm Thịt Heo Xào Hành Tây
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Sụn Gà Rang Muối
                  </div>
                  <div className="combo-item">
                    <div className="combo-item-dot"></div>Yakult Đào
                  </div>
                </div>
                <button className="combo-order-btn" onClick={() => handleComboAlert('Thanh Xuân')}>
                  Đặt combo này →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY US ============ */}
      <section className="section why-section">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="section-header reveal">
            <div className="section-tag">
              <span className="tag tag--fire">💪 Tại sao chọn chúng tôi</span>
            </div>
            <h2 className="section-title">
              Vì sao Hà Nội <span>chọn HakyFood</span>?
            </h2>
            <div className="section-divider"></div>
          </div>
          <div className="why-grid">
            <div className="why-card reveal">
              <div className="why-icon wi-1">🌙</div>
              <div className="why-title">Mở đến 3:00 sáng</div>
              <div className="why-desc">
                Đêm khuya cũng có người phục vụ. Từ 18:30 đến 3:00 AM mỗi ngày.
              </div>
            </div>
            <div className="why-card reveal" style={{ animationDelay: '0.1s' }}>
              <div className="why-icon wi-2">⚡</div>
              <div className="why-title">Giao hàng nhanh</div>
              <div className="why-desc">
                Đặt là có ngay. Phục vụ khu vực Hà Nội, giao tận nơi bạn đang ngồi.
              </div>
            </div>
            <div className="why-card reveal" style={{ animationDelay: '0.2s' }}>
              <div className="why-icon wi-3">🍽</div>
              <div className="why-title">60+ món đa dạng</div>
              <div className="why-desc">
                Cơm rang, mì xào, đồ nhậu, ăn vặt, trà sữa — đủ cả cho một đêm dài.
              </div>
            </div>
            <div className="why-card reveal" style={{ animationDelay: '0.3s' }}>
              <div className="why-icon wi-4">🌶</div>
              <div className="why-title">Vị đặc trưng HakyFood</div>
              <div className="why-desc">
                Sốt Haky độc quyền, không thể tìm thấy ở nơi khác. Một lần ăn, nhớ mãi.
              </div>
            </div>
            <div className="why-card reveal" style={{ animationDelay: '0.4s' }}>
              <div className="why-icon wi-5">🤝</div>
              <div className="why-title">Đặt dễ, giá tốt</div>
              <div className="why-desc">
                Chỉ cần gọi điện, không cần app. Combo từ 120K cho một bữa đầy đủ.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="cta-section" id="lien-he">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="cta-inner">
            <div className="cta-text">
              <h2 className="cta-title">
                Đói rồi? Gọi ngay<br />
                <span>HakyFood</span> thôi!
              </h2>
              <p className="cta-sub">Phục vụ 18:30 – 3:00 AM · Ship tận nơi · Hà Nội</p>
            </div>
            <div className="cta-actions">
              <a href="tel:0347806464" className="cta-phone">
                📞 034 780 6464
              </a>
              <a href="#menu" className="cta-order">
                Xem thực đơn →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
