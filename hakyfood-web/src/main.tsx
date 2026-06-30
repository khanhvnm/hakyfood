import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { queryClient } from './lib/query'
import { routeTree } from './routeTree.gen' // File này sẽ tự động sinh sau khi chạy dev server
import './index.css'

// 1. Khởi tạo Router và truyền cấu hình routeTree vào
const router = createRouter({ routeTree })

// 2. Đăng ký kiểu dữ liệu Router với TypeScript để được type-safe khi chuyển trang
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// 3. Render ứng dụng bọc bởi các Provider cần thiết
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)