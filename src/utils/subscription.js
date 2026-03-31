/**
 * Утилита для работы с подпиской AtomPro+ КОМЕНТАРИИ ДЛЯ РАЗРАБОВ А НЕ ПОВОД ГОВОРИТЬ ЧТО ИИ ПИСАЛ
 */

import axios from '../system/axios';

/**
 * Проверяет наличие активной подписки AtomPro+
 * @returns {Promise<{isActive: boolean, expiresAt: Date|null, subscription: object}>}
 */
export const checkSubscription = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { isActive: false, expiresAt: null, subscription: null };
    }

    const response = await axios.get('/subscription/info');

    const data = response.data;
    return {
      isActive: data.subscription?.isActive || false,
      expiresAt: data.subscription?.expiresAt ? new Date(data.subscription.expiresAt) : null,
      subscription: data.subscription,
      balance: data.balance || 0
    };
  } catch (error) {
    console.error('Ошибка проверки подписки:', error);
    return { isActive: false, expiresAt: null, subscription: null };
  }
};

/**
 * Покупает подписку AtomPro+ за ATM
 * @param {string} duration - 'week' или 'month'
 * @returns {Promise<{success: boolean, message: string, requiresTelegram?: boolean, telegramUrl?: string}>}
 */
export const purchaseSubscription = async (duration = 'week') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Требуется авторизация' };
    }

    const response = await axios.post('/subscription/purchase', { duration });
    return response.data;
  } catch (error) {
    console.error('Ошибка покупки подписки:', error);
    const errorMessage = error.response?.data?.message || 'Ошибка при покупке подписки';
    return { success: false, message: errorMessage };
  }
};

/**
 * Хук для проверки подписки (можно использовать в компонентах)
 * @param {Function} callback - функция, которая будет вызвана с результатом проверки
 */
export const useSubscription = (callback) => {
  const check = async () => {
    const result = await checkSubscription();
    if (callback) callback(result);
    return result;
  };

  return { check, checkSubscription: check };
};

/**
 * Проверяет, истекла ли подписка
 * @param {Date|string|null} expiresAt - дата истечения подписки
 * @returns {boolean}
 */
export const isSubscriptionExpired = (expiresAt) => {
  if (!expiresAt) return true;
  const expiryDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return new Date() > expiryDate;
};

/**
 * Получает оставшееся время подписки в днях
 * @param {Date|string|null} expiresAt - дата истечения подписки
 * @returns {number|null} - количество дней или null если подписка истекла
 */
export const getSubscriptionDaysLeft = (expiresAt) => {
  if (!expiresAt) return null;
  const expiryDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const now = new Date();
  const diff = expiryDate - now;
  
  if (diff <= 0) return null;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};



// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00


// Author: Dmitry Khorov
// Telegram: @dkdevelop @jpegweb
// DK Studio Production 
// 2026 год 1 января 00:00
