import axios from 'axios';

// 1. Tạo instance của axios với cấu hình mặc định
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Tự động ngắt nếu request quá 10 giây
    withCredentials: true, // Hỗ trợ gửi/nhận cookie (e.g. refreshToken)
});

// 2. Request Interceptor: Tự động đính kèm token khi gửi request
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor: Format và xử lý lỗi tập trung
api.interceptors.response.use(
    (response) => {
        // Nếu response thành công, trả về data trực tiếp
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const apiError = error.response.data;

            console.error(`[API Error] Status: ${status}`, apiError);

            if (status === 401) {
                localStorage.removeItem('accessToken');
            }
        } else if (error.request) {
            console.error('[API Error] No response received from server: ', error.request);
        } else {
            console.error('[API Error] Request setup error: ', error.message);
        }

        return Promise.reject(error);
    }
);