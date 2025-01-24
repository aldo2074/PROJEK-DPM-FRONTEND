import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add request interceptor
axios.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });
        
        if (error.response?.status === 401) {
            // Handle unauthorized error (e.g., clear token and redirect to login)
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            // You might want to implement navigation to login screen here
        }
        
        return Promise.reject(error);
    }
);

export default axios; 