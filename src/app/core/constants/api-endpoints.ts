export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    sendOtp: '/auth/sendotp',
    sendOtpRegister: '/auth/sendotpregister',
    verifyOtp: '/auth/verifyotp',
  },
  health: {
    check: '/health-check',
  },
  user: {
    register: '/user/register',
    update: '/user/update',
    byId: (id: string | number) => `/user/${id}`,
  },
  role: {
    list: '/role',
    create: '/role',
    delete: (id: string | number) => `/role/${id}`,
  },
  brand: {
    list: '/brands',
  },
  category: {
    list: '/categories',
  },
  product: {
    list: '/products',
    byId: (id: string | number) => `/products/${id}`,
  },
  attribute: {
    list: '/attributes',
    byCategory: (categoryId: string | number) => `/categories/${categoryId}/attributes`,
  },
  search: {
    brand: '/search/brand',
  },
} as const;
