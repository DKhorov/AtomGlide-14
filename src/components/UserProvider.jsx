import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, fetchUser } from '../system/redux/slices/getme';
import userService from '../system/userService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (token && !user) {
          await dispatch(fetchUser());
        }
      } catch (err) {
        console.error('Ошибка инициализации пользователя:', err);
        setError(err.message);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [dispatch, user]);

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: userService.isAuthenticated(),
    getCurrentUser: userService.getCurrentUser.bind(userService),
    getUserById: userService.getUserById.bind(userService),
    logout: userService.logout.bind(userService),
    refreshUser: userService.refreshUser.bind(userService),
    getToken: userService.getToken.bind(userService),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider; 
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
