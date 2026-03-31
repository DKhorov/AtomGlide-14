import store from './redux/store';
import { fetchUser } from './redux/slices/getme';
import { fetchAuthMe } from './redux/slices/auth';

class UserService {
  constructor() {
    this.user = null;
    this.isLoading = false;
    this.listeners = [];
  }

  async getCurrentUser() {
    const state = store.getState();
    const user = state.user.user;
    
    if (user) {
      return user;
    }

    try {
      this.isLoading = true;
      const result = await store.dispatch(fetchUser());
      if (result.payload) {
        this.user = result.payload;
        this.notifyListeners();
        return this.user;
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
    } finally {
      this.isLoading = false;
    }

    return null;
  }

  async getUserById(userId) {
    try {
      const response = await fetch(`https://atomglidedev.ru/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Пользователь не найден');
      }
      
      const data = await response.json();
      return data.user || data;
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      throw error;
    }
  }

  isAuthenticated() {
    const state = store.getState();
    return state.user.isAuthenticated && !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user = null;
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }

  async refreshUser() {
    try {
      const result = await store.dispatch(fetchUser());
      if (result.payload) {
        this.user = result.payload;
        this.notifyListeners();
        return this.user;
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
    }
    return null;
  }
}

export const userService = new UserService();
export default userService; 
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/


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
