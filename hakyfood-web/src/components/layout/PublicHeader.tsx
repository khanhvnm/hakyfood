import { Link, useLocation } from '@tanstack/react-router';
import logoImg from '@/assets/logo.png';
import { useCartStore } from '@/features/cart/store/useCartStore';

export function PublicHeader() {
  // Các trạng thái giả lập (Mock state) để biểu diễn cấu trúc động
  const isLoggedIn = false;
  const user = {
    name: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150',
  };
  const totalItems = useCartStore((state) => state.getCartTotalItems());
  const cartItems = useCartStore((state) => state.items);
  let currentLang = 'vi' as string; // Ngôn ngữ đang hoạt động giả lập: 'vi' hoặc 'en'
  const location = useLocation();
  const isHomeActive = location.pathname === '/';
  const isFoodsActive = location.pathname.startsWith('/foods');

  const checkStoreStatus = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour < 4;
  };
  const isOpen = checkStoreStatus();

  return (
    <header className="fixed top-0 left-0 right-0 bg-hk-bg-dark text-hk-text-inverse">
      <div className="max-w-300 mx-auto w-full">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <>
                  <span className="relative flex justify-center items-center h-2.5 w-2.5 mt-0.5">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-green-300"></span>
                    <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>Đang mở cửa (18:00 - 04:00)</span>
                </>
              ) : (
                <>
                  <span className="relative flex justify-center items-center h-2.5 w-2.5 mt-0.5">
                    <span className="relative rounded-full h-2 w-2 bg-gray-500"></span>
                  </span>
                  <span>Đóng cửa (Mở cửa từ 18:00)</span>
                </>
              )}
            </div>

            <div className="w-px h-4 bg-white/50 mx-2.5 mt-0.5"></div>

            <div className="flex items-center gap-1">
              <span>Kết nối </span>
              <a href="https://www.facebook.com/shipdoandemhaky" target="_blank" rel="noreferrer">
                <svg className="w-6 h-6 text-white hover:text-hk-secondary transition-colors duration-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12.05C19.9813 10.5255 19.5273 9.03809 18.6915 7.76295C17.8557 6.48781 16.673 5.47804 15.2826 4.85257C13.8921 4.2271 12.3519 4.01198 10.8433 4.23253C9.33473 4.45309 7.92057 5.10013 6.7674 6.09748C5.61422 7.09482 4.77005 8.40092 4.3343 9.86195C3.89856 11.323 3.88938 12.8781 4.30786 14.3442C4.72634 15.8103 5.55504 17.1262 6.69637 18.1371C7.83769 19.148 9.24412 19.8117 10.75 20.05V14.38H8.75001V12.05H10.75V10.28C10.7037 9.86846 10.7483 9.45175 10.8807 9.05931C11.0131 8.66687 11.23 8.30827 11.5161 8.00882C11.8022 7.70936 12.1505 7.47635 12.5365 7.32624C12.9225 7.17612 13.3368 7.11255 13.75 7.14003C14.3498 7.14824 14.9482 7.20173 15.54 7.30003V9.30003H14.54C14.3676 9.27828 14.1924 9.29556 14.0276 9.35059C13.8627 9.40562 13.7123 9.49699 13.5875 9.61795C13.4627 9.73891 13.3667 9.88637 13.3066 10.0494C13.2464 10.2125 13.2237 10.387 13.24 10.56V12.07H15.46L15.1 14.4H13.25V20C15.1399 19.7011 16.8601 18.7347 18.0985 17.2761C19.3369 15.8175 20.0115 13.9634 20 12.05Z" fill="currentColor"></path>
                </svg>
              </a>
              <a href="https://www.instagram.com/hakyfood.shipdoandem" target="_blank" rel="noreferrer">
                <svg className="w-4.5 h-4.5 text-white hover:text-hk-secondary transition-colors duration-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"></path>
                  <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" fill="currentColor"></path>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative group">
              <Link to="/" className="flex items-center gap-1 group-hover:text-hk-secondary transition-colors duration-200">
                <svg className="w-4.5 h-4.5 mt-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19.25C15 20.0456 14.6839 20.8087 14.1213 21.3713C13.5587 21.9339 12.7956 22.25 12 22.25C11.2044 22.25 10.4413 21.9339 9.87869 21.3713C9.31608 20.8087 9 20.0456 9 19.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M5.58096 18.25C5.09151 18.1461 4.65878 17.8626 4.36813 17.4553C4.07748 17.048 3.95005 16.5466 4.01098 16.05L5.01098 7.93998C5.2663 6.27263 6.11508 4.75352 7.40121 3.66215C8.68734 2.57077 10.3243 1.98054 12.011 1.99998V1.99998C13.6977 1.98054 15.3346 2.57077 16.6207 3.66215C17.9069 4.75352 18.7557 6.27263 19.011 7.93998L20.011 16.05C20.0723 16.5452 19.9462 17.0454 19.6576 17.4525C19.369 17.8595 18.9386 18.144 18.451 18.25C14.2186 19.2445 9.81332 19.2445 5.58096 18.25V18.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Thông báo</span>
              </Link>

              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-lg shadow-xl z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 origin-top-right text-gray-800">
                <div className="px-4 py-2 border-b border-gray-100 text-gray-400">Thông Báo Mới Nhận</div>

                <ul className="max-h-64 overflow-y-auto">
                  <li className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <Link to="/" className="flex gap-3 p-3">
                      <div className="w-8 h-8 rounded-full bg-hk-primary-subtle flex items-center justify-center flex-shrink-0 text-sm">
                        🍔
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-900">Đơn hàng đang giao!</span>
                        <span className="text-[11px] text-gray-500 line-clamp-2">Đơn hàng #HK-8492 của bạn đang được tài xế giao đi.</span>
                        <span className="text-[10px] text-gray-400">2 phút trước</span>
                      </div>
                    </Link>
                  </li>
                  <li className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <Link to="/" className="flex gap-3 p-3">
                      <div className="w-8 h-8 rounded-full bg-hk-secondary-subtle flex items-center justify-center flex-shrink-0 text-sm">
                        🎁
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-900">Khuyến mãi đêm khuya!</span>
                        <span className="text-[11px] text-gray-500 line-clamp-2">Nhập mã DEMHANOI giảm ngay 20k cho đơn trên 100k.</span>
                        <span className="text-[10px] text-gray-400">1 giờ trước</span>
                      </div>
                    </Link>
                  </li>
                  <li className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <Link to="/" className="flex gap-3 p-3">
                      <div className="w-8 h-8 rounded-full bg-hk-secondary-subtle flex items-center justify-center flex-shrink-0 text-sm">
                        🎁
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-900">Khuyến mãi đêm khuya!</span>
                        <span className="text-[11px] text-gray-500 line-clamp-2">Nhập mã DEMHANOI giảm ngay 20k cho đơn trên 100k.</span>
                        <span className="text-[10px] text-gray-400">1 giờ trước</span>
                      </div>
                    </Link>
                  </li>
                  <li className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <Link to="/" className="flex gap-3 p-3">
                      <div className="w-8 h-8 rounded-full bg-hk-secondary-subtle flex items-center justify-center flex-shrink-0 text-sm">
                        🎁
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-900">Khuyến mãi đêm khuya!</span>
                        <span className="text-[11px] text-gray-500 line-clamp-2">Nhập mã DEMHANOI giảm ngay 20k cho đơn trên 100k.</span>
                        <span className="text-[10px] text-gray-400">1 giờ trước</span>
                      </div>
                    </Link>
                  </li>
                  <li className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <Link to="/" className="flex gap-3 p-3">
                      <div className="w-8 h-8 rounded-full bg-hk-secondary-subtle flex items-center justify-center flex-shrink-0 text-sm">
                        🎁
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-900">Khuyến mãi đêm khuya!</span>
                        <span className="text-[11px] text-gray-500 line-clamp-2">Nhập mã DEMHANOI giảm ngay 20k cho đơn trên 100k.</span>
                        <span className="text-[10px] text-gray-400">1 giờ trước</span>
                      </div>
                    </Link>
                  </li>
                </ul>

                <div className="text-center border-t border-gray-100">
                  <Link to="/" className="block w-full py-2.5 text-xs font-medium text-gray-600 hover:text-hk-primary hover:bg-gray-50 transition-colors rounded-b-lg">
                    Xem tất cả
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/" className="flex items-center gap-1 hover:text-hk-secondary transition-colors duration-200">
              <svg className="w-4.5 h-4.5 mt-0.5" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M300 462.4h424.8v48H300v-48zM300 673.6H560v48H300v-48z" fill="currentColor"></path>
                <path d="M818.4 981.6H205.6c-12.8 0-24.8-2.4-36.8-7.2-11.2-4.8-21.6-11.2-29.6-20-8.8-8.8-15.2-18.4-20-29.6-4.8-12-7.2-24-7.2-36.8V250.4c0-12.8 2.4-24.8 7.2-36.8 4.8-11.2 11.2-21.6 20-29.6 8.8-8.8 18.4-15.2 29.6-20 12-4.8 24-7.2 36.8-7.2h92.8v47.2H205.6c-25.6 0-47.2 20.8-47.2 47.2v637.6c0 25.6 20.8 47.2 47.2 47.2h612c25.6 0 47.2-20.8 47.2-47.2V250.4c0-25.6-20.8-47.2-47.2-47.2H725.6v-47.2h92.8c12.8 0 24.8 2.4 36.8 7.2 11.2 4.8 21.6 11.2 29.6 20 8.8 8.8 15.2 18.4 20 29.6 4.8 12 7.2 24 7.2 36.8v637.6c0 12.8-2.4 24.8-7.2 36.8-4.8 11.2-11.2 21.6-20 29.6-8.8 8.8-18.4 15.2-29.6 20-12 5.6-24 8-36.8 8z" fill="currentColor"></path>
                <path d="M747.2 297.6H276.8V144c0-32.8 26.4-59.2 59.2-59.2h60.8c21.6-43.2 66.4-71.2 116-71.2 49.6 0 94.4 28 116 71.2h60.8c32.8 0 59.2 26.4 59.2 59.2l-1.6 153.6z m-423.2-47.2h376.8V144c0-6.4-5.6-12-12-12H595.2l-5.6-16c-11.2-32.8-42.4-55.2-77.6-55.2-35.2 0-66.4 22.4-77.6 55.2l-5.6 16H335.2c-6.4 0-12 5.6-12 12v106.4z" fill="currentColor"></path>
              </svg>
              <span>Đơn hàng của tôi</span>
            </Link>

            <div className="flex items-center px-3 py-0.5 rounded-full border border-white/15 text-sm font-medium text-white/80">
              <a href="/" className={currentLang === 'vi' ? 'text-hk-secondary' : 'hover:text-hk-text-inverse transition-colors duration-200'}>VI</a>
              <span className="text-white/15 mx-2 mb-0.5">|</span>
              <a href="/" className={currentLang === 'en' ? 'text-hk-secondary' : 'hover:text-hk-text-inverse transition-colors duration-200'}>EN</a>
            </div>

            <>
              {isLoggedIn ? (
                <div className="flex items-center gap-2 text-xs">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-6 h-6 rounded-full object-cover bg-hk-bg-surface border border-white/20" alt={user.name} />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-hk-bg-dark shadow-sm">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1992 12C14.9606 12 17.1992 9.76142 17.1992 7C17.1992 4.23858 14.9606 2 12.1992 2C9.43779 2 7.19922 4.23858 7.19922 7C7.19922 9.76142 9.43779 12 12.1992 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M3 22C3.57038 20.0332 4.74796 18.2971 6.3644 17.0399C7.98083 15.7827 9.95335 15.0687 12 15C16.12 15 19.63 17.91 21 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  )}
                  <span>{user.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Link to="/login" className="hover:text-hk-secondary transition-colors duration-200">Đăng ký</Link>
                  <div className="w-px h-4 bg-white/50 mx-2.5 mt-0.5"></div>
                  <Link to="/register" className="hover:text-hk-secondary transition-colors duration-200">Đăng nhập</Link>
                </div>
              )}
            </>
          </div>
        </div>

        <div className="h-22.5 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center group transition-transform duration-300 ease-out hover:scale-105"
          >
            <img src={logoImg} alt="HakyFood Logo" className="h-16 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-20">
            <nav>
              <ul className="flex items-center gap-6 font-bold uppercase">
                <li>
                  <Link
                    to="/"
                    className={
                      `relative transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-hk-secondary after:transition-transform after:duration-250
                      ${isHomeActive
                        ? 'text-hk-secondary after:scale-x-100'
                        : 'hover:text-hk-secondary after:scale-x-0 after:origin-left hover:after:scale-x-100'
                      }`}
                  >
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/foods"
                    className={
                      `relative transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-hk-secondary after:transition-transform after:duration-250
                      ${isFoodsActive
                        ? 'text-hk-secondary after:scale-x-100'
                        : 'hover:text-hk-secondary after:scale-x-0 after:origin-left hover:after:scale-x-100'
                      }`}
                  >
                    Menu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/foods"
                    className={
                      `relative transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-hk-secondary after:transition-transform after:duration-250
                      ${isFoodsActive
                        ? 'text-hk-secondary after:scale-x-100'
                        : 'hover:text-hk-secondary after:scale-x-0 after:origin-left hover:after:scale-x-100'
                      }`}
                  >
                    Chính sách hoàn tiền
                  </Link>
                </li>
                <li>
                  <Link
                    to="/foods"
                    className={
                      `relative transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-hk-secondary after:transition-transform after:duration-250
                      ${isFoodsActive
                        ? 'text-hk-secondary after:scale-x-100'
                        : 'hover:text-hk-secondary after:scale-x-0 after:origin-left hover:after:scale-x-100'
                      }`}
                  >
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </nav>

            <div id="search-bar">
              <form className="relative flex items-center w-52 focus-within:w-64 transition-all duration-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/8 hover:border-white/20">
                <input
                  type="text"
                  placeholder="Tìm món ăn đêm..."
                  className="w-full py-1.5 pl-4 pr-9 bg-transparent border-none outline-none text-xs text-white placeholder-white/35 focus:ring-0 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 flex items-center justify-center p-1 text-white/50 hover:text-hk-secondary transition-colors duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </form>
            </div>
          </div>

          <div id="main-header-right">
            <div id="cart" className="relative group">
              <a
                href="/cart"
                className="relative p-2.5 flex items-center justify-center text-white/70 group-hover:text-hk-secondary transition-colors duration-200 cursor-pointer"
              >
                {/* Icon Cart SVG mới */}
                <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="currentColor" strokeWidth="1.5"></path>
                  <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="currentColor" strokeWidth="1.5"></path>
                  <path d="M2.26121 3.09184L2.50997 2.38429H2.50997L2.26121 3.09184ZM2.24876 2.29246C1.85799 2.15507 1.42984 2.36048 1.29246 2.75124C1.15507 3.14201 1.36048 3.57016 1.75124 3.70754L2.24876 2.29246ZM4.58584 4.32298L5.20507 3.89983V3.89983L4.58584 4.32298ZM5.88772 14.5862L5.34345 15.1022H5.34345L5.88772 14.5862ZM20.6578 9.88275L21.3923 10.0342L21.3933 10.0296L20.6578 9.88275ZM20.158 12.3075L20.8926 12.4589L20.158 12.3075ZM20.7345 6.69708L20.1401 7.15439L20.7345 6.69708ZM19.1336 15.0504L18.6598 14.469L19.1336 15.0504ZM5.70808 9.76V7.03836H4.20808V9.76H5.70808ZM2.50997 2.38429L2.24876 2.29246L1.75124 3.70754L2.01245 3.79938L2.50997 2.38429ZM10.9375 16.25H16.2404V14.75H10.9375V16.25ZM5.70808 7.03836C5.70808 6.3312 5.7091 5.7411 5.65719 5.26157C5.60346 4.76519 5.48705 4.31247 5.20507 3.89983L3.96661 4.74613C4.05687 4.87822 4.12657 5.05964 4.1659 5.42299C4.20706 5.8032 4.20808 6.29841 4.20808 7.03836H5.70808ZM2.01245 3.79938C2.68006 4.0341 3.11881 4.18965 3.44166 4.34806C3.74488 4.49684 3.87855 4.61727 3.96661 4.74613L5.20507 3.89983C4.92089 3.48397 4.54304 3.21763 4.10241 3.00143C3.68139 2.79485 3.14395 2.60719 2.50997 2.38429L2.01245 3.79938ZM4.20808 9.76C4.20808 11.2125 4.22171 12.2599 4.35876 13.0601C4.50508 13.9144 4.79722 14.5261 5.34345 15.1022L6.43198 14.0702C6.11182 13.7325 5.93913 13.4018 5.83723 12.8069C5.72607 12.1578 5.70808 11.249 5.70808 9.76H4.20808ZM10.9375 14.75C9.52069 14.75 8.53763 14.7482 7.79696 14.6432C7.08215 14.5418 6.70452 14.3576 6.43198 14.0702L5.34345 15.1022C5.93731 15.7286 6.69012 16.0013 7.58636 16.1283C8.45674 16.2518 9.56535 16.25 10.9375 16.25V14.75ZM4.95808 6.87H17.0888V5.37H4.95808V6.87ZM19.9232 9.73135L19.4235 12.1561L20.8926 12.4589L21.3923 10.0342L19.9232 9.73135ZM17.0888 6.87C17.9452 6.87 18.6989 6.871 19.2937 6.93749C19.5893 6.97053 19.8105 7.01643 19.9659 7.07105C20.1273 7.12776 20.153 7.17127 20.1401 7.15439L21.329 6.23978C21.094 5.93436 20.7636 5.76145 20.4632 5.65587C20.1567 5.54818 19.8101 5.48587 19.4604 5.44678C18.7646 5.369 17.9174 5.37 17.0888 5.37V6.87ZM21.3933 10.0296C21.5625 9.18167 21.7062 8.47024 21.7414 7.90038C21.7775 7.31418 21.7108 6.73617 21.329 6.23978L20.1401 7.15439C20.2021 7.23508 20.2706 7.38037 20.2442 7.80797C20.2168 8.25191 20.1002 8.84478 19.9223 9.73595L21.3933 10.0296ZM16.2404 16.25C17.0021 16.25 17.6413 16.2513 18.1566 16.1882C18.6923 16.1227 19.1809 15.9794 19.6074 15.6318L18.6598 14.469C18.5346 14.571 18.3571 14.6525 17.9744 14.6994C17.5712 14.7487 17.0397 14.75 16.2404 14.75V16.25ZM19.4235 12.1561C19.2621 12.9389 19.1535 13.4593 19.0238 13.8442C18.9007 14.2095 18.785 14.367 18.6598 14.469L19.6074 15.6318C20.0339 15.2842 20.2729 14.8346 20.4453 14.3232C20.6111 13.8312 20.7388 13.2049 20.8926 12.4589L19.4235 12.1561Z" fill="currentColor"></path>
                </svg>

                {/* Badge hiển thị số lượng (chỉ hiển thị khi đã đăng nhập và giỏ hàng có món) */}
                {isLoggedIn && totalItems > 0 && (
                  <span className="absolute top-1.5 right-1 bg-white text-hk-primary font-hk-display text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm leading-none border border-hk-primary/10">
                    {totalItems}
                  </span>
                )}
              </a>

              {/* Dropdown hiển thị 5 sản phẩm mới thêm khi hover (Shopee style) */}
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-100 rounded-lg shadow-xl z-50 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 origin-top-right text-gray-800">
                {/* Header Dropdown */}
                <div className="px-4 py-2.5 border-b border-gray-100 text-xs font-semibold text-gray-400">
                  Sản phẩm mới thêm
                </div>

                {/* Danh sách món ăn trong giỏ */}
                {cartItems.length > 0 ? (
                  <>
                    <ul className="max-h-80 overflow-y-auto">
                      {[...cartItems]
                        .reverse()
                        .slice(0, 5)
                        .map((item) => (
                          <li
                            key={item.cartItemId}
                            className="flex items-center gap-3 p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded bg-gray-50 border border-gray-100 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-hk-primary-subtle text-hk-primary flex items-center justify-center flex-shrink-0 text-lg border border-gray-100">
                                🍔
                              </div>
                            )}

                            <div className="flex-grow min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 truncate">
                                {item.name}
                              </h4>
                              {item.selectedOptions && item.selectedOptions.length > 0 && (
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                  {item.selectedOptions
                                    .map((opt) => opt.optionItemName)
                                    .join(', ')}
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0 text-right">
                              <span className="text-xs font-bold text-hk-primary">
                                {item.totalUnitPrice.toLocaleString()}đ
                              </span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">
                                x{item.quantity}
                              </span>
                            </div>
                          </li>
                        ))}
                    </ul>

                    {/* Footer Dropdown */}
                    <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-lg">
                      {cartItems.length > 5 && (
                        <span className="text-[11px] text-gray-400 font-medium">
                          Còn {cartItems.length - 5} sản phẩm nữa
                        </span>
                      )}
                      <a
                        href="/cart"
                        className="ml-auto bg-hk-primary hover:bg-hk-primary-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-[0_3px_10px_rgba(196,75,32,0.3)] hover:-translate-y-0.5 active:scale-95"
                      >
                        Xem giỏ hàng
                      </a>
                    </div>
                  </>
                ) : (
                  // Trạng thái giỏ hàng trống
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
                    <span className="text-4xl mb-2">🛒</span>
                    <span className="text-xs font-medium text-gray-500">Chưa có sản phẩm nào</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div >
    </header >
  );
}
