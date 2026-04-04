import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('sms_user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const forgotPasswordAPI = (data) => API.post('/auth/forgot-password', data);
export const getMeAPI = () => API.get('/auth/me');

// Products
export const getProductsAPI = () => API.get('/products');
export const getProductAPI = (id) => API.get(`/products/${id}`);
export const createProductAPI = (data) => API.post('/products', data);
export const updateProductAPI = (id, data) => API.put(`/products/${id}`, data);
export const deleteProductAPI = (id) => API.delete(`/products/${id}`);

// Plans
export const getPlansAPI = () => API.get('/plans');
export const getPlanAPI = (id) => API.get(`/plans/${id}`);
export const createPlanAPI = (data) => API.post('/plans', data);
export const updatePlanAPI = (id, data) => API.put(`/plans/${id}`, data);
export const deletePlanAPI = (id) => API.delete(`/plans/${id}`);

// Quotation Templates
export const getTemplatesAPI = () => API.get('/quotations/templates');
export const createTemplateAPI = (data) => API.post('/quotations/templates', data);
export const updateTemplateAPI = (id, data) => API.put(`/quotations/templates/${id}`, data);
export const deleteTemplateAPI = (id) => API.delete(`/quotations/templates/${id}`);

// Subscriptions
export const getSubscriptionsAPI = () => API.get('/subscriptions');
export const getSubscriptionAPI = (id) => API.get(`/subscriptions/${id}`);
export const createSubscriptionAPI = (data) => API.post('/subscriptions', data);
export const updateSubscriptionAPI = (id, data) => API.put(`/subscriptions/${id}`, data);
export const updateSubscriptionStatusAPI = (id, data) => API.put(`/subscriptions/${id}/status`, data);
export const deleteSubscriptionAPI = (id) => API.delete(`/subscriptions/${id}`);

// Invoices
export const getInvoicesAPI = () => API.get('/invoices');
export const getInvoiceAPI = (id) => API.get(`/invoices/${id}`);
export const createInvoiceAPI = (data) => API.post('/invoices', data);
export const updateInvoiceStatusAPI = (id, data) => API.put(`/invoices/${id}/status`, data);
export const sendInvoiceAPI = (id) => API.post(`/invoices/${id}/send`);
export const printInvoiceAPI = (id) => API.get(`/invoices/${id}/print`);

// Payments
export const getPaymentsAPI = () => API.get('/payments');
export const createPaymentAPI = (data) => API.post('/payments', data);

// Discounts
export const getDiscountsAPI = () => API.get('/discounts');
export const createDiscountAPI = (data) => API.post('/discounts', data);
export const updateDiscountAPI = (id, data) => API.put(`/discounts/${id}`, data);
export const deleteDiscountAPI = (id) => API.delete(`/discounts/${id}`);

// Taxes
export const getTaxesAPI = () => API.get('/taxes');
export const createTaxAPI = (data) => API.post('/taxes', data);
export const updateTaxAPI = (id, data) => API.put(`/taxes/${id}`, data);
export const deleteTaxAPI = (id) => API.delete(`/taxes/${id}`);

// Users
export const getUsersAPI = () => API.get('/users');
export const createInternalUserAPI = (data) => API.post('/users', data);
export const updateUserAPI = (id, data) => API.put(`/users/${id}`, data);
export const deleteUserAPI = (id) => API.delete(`/users/${id}`);

// Reports
export const getDashboardStatsAPI = () => API.get('/reports/dashboard');
export const getRevenueReportAPI = (startDate, endDate) => API.get('/reports/revenue', { params: { startDate, endDate } });
export const getSubscriptionReportAPI = () => API.get('/reports/subscriptions');
export const getOverdueInvoicesAPI = () => API.get('/reports/overdue-invoices');

export default API;
