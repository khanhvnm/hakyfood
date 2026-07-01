import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// 1. Tạo instance của axios với cấu hình mặc định
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Tự động ngắt nếu request quá 10 giây
    withCredentials: true, // Hỗ trợ gửi/nhận cookie (e.g. refreshToken)
});

// 2. Request Interceptor: Tự động đính kèm token từ in-memory store
api.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor: Xử lý silent refresh khi nhận 401
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Chỉ thử refresh khi nhận 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Nếu request bị lỗi chính là refresh-token thì không retry nữa
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Đợi trong hàng đợi nếu đang refresh
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await api.post('/auth/refresh-token');
                const newAccessToken = response.data?.data?.accessToken;

                if (newAccessToken) {
                    useAuthStore.getState().setAuth(newAccessToken);
                    processQueue(null, newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } else {
                    useAuthStore.getState().logout();
                    processQueue(error, null);
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                useAuthStore.getState().logout();
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response) {
            const status = error.response.status;
            const apiError = error.response.data;
            console.error(`[API Error] Status: ${status}`, apiError);
        } else if (error.request) {
            console.error('[API Error] No response received from server: ', error.request);
        } else {
            console.error('[API Error] Request setup error: ', error.message);
        }

        return Promise.reject(error);
    }
);