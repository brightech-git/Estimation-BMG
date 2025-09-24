import React, { createContext, useState } from 'react';
import axios from 'axios';

export const UserContext = createContext();

const BASE_URL = 'https://est.bmgjewellers.com/api/v1';

export const UserProvider = ({ children }) => {
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Login function to call from components
    const login = async (inputUsername, inputPassword) => {
        try {
            const response = await axios.get(`${BASE_URL}/loginData`);
            const user = response.data.find(u => u.USERNAME === inputUsername);

            if (user && user.PLAIN_PASSWORD === inputPassword) {
                setUsername(inputUsername);
                setUserId(user.USERID || user.userId || user.id || null); // Adjust key name
                setIsLoggedIn(true);
                return { success: true };
            } else {
                return { success: false, message: 'Invalid username or password' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Server error' };
        }
    };

    return (
        <UserContext.Provider value={{ username, userId, isLoggedIn, login, setUsername, setUserId }}>
            {children}
        </UserContext.Provider>
    );
};
