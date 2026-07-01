import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { queryClient } from './lib/query'
import { routeTree } from './routeTree.gen' // File này sẽ tự động sinh sau khi chạy dev server
import { useAuthStore } from './features/auth/store/useAuthStore'
import { refreshTokenApi } from './features/auth/api/auth'
import './index.css'

// 1. Khởi tạo Router và truyền cấu hình routeTree vào
const router = createRouter({ routeTree })

// 2. Đăng ký kiểu dữ liệu Router với TypeScript để được type-safe khi chuyển trang
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// 3. Component bọc ngoài để khởi tạo trạng thái xác thực
function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { setAuth, setInitialized } = useAuthStore()

  useEffect(() => {
    // Khi app khởi động, thử refresh token từ HTTP-only cookie
    const initAuth = async () => {
      try {
        const response = await refreshTokenApi()
        if (response.success && response.data?.accessToken) {
          setAuth(response.data.accessToken)
        } else {
          setInitialized()
        }
      } catch {
        // Không có refresh token hợp lệ -> chưa đăng nhập
        setInitialized()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [setAuth, setInitialized])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hk-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-hk-primary/30 border-t-hk-primary rounded-full animate-spin"></div>
          <p className="text-hk-text-muted text-sm font-hk-body animate-pulse">
            Đang khởi tạo HakyFood...
          </p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

// 4. Render ứng dụng bọc bởi StrictMode
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)