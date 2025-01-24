import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { VALIDATE_TOKEN_URL } from '../api';

export const validateToken = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
            return { isValid: false };
        }

        const response = await axios.get(VALIDATE_TOKEN_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return { 
            isValid: response.data.success,
            user: response.data.user
        };
    } catch (error) {
        console.error('Token validation error:', error);
        return { isValid: false };
    }
};

export const clearAuth = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
}; 