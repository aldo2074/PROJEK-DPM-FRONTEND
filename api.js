const BASE_URL = 'http://172.20.10.3:3000'; 

export const AUTH_URL = `${BASE_URL}/auth`;
export const VALIDATE_TOKEN_URL = `${AUTH_URL}/validate`;
export const PROFILE_URL = `${BASE_URL}/profile`;
export const CART_URL = `${BASE_URL}/cart`;
export const ORDER_URL = `${BASE_URL}/orders`;
export const NOTIFICATION_URL = `${BASE_URL}/notifications`;

// Tambahkan endpoint untuk admin
export const ADMIN_AUTH_URL = `${AUTH_URL}/admin`;
export const ADMIN_REGISTER_URL = `${AUTH_URL}/register-admin`;