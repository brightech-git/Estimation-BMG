import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const LoginContext = createContext();

export const LoginProvider = ({ children, showToast }) => {
  // 👇 your existing states
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);

  // 👇 new additions for company info
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyUrl, setCompanyUrl] = useState(null);

  // full API response (if needed anywhere)
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔐 Login function
  const login = async (username, password) => {
    try {
      setLoading(true);

      const response = await axios.post(
        "https://app.bmgjewellers.com/api/v1/company/getByCredentials",
        { username, password },
        {
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        // ✅ Set everything exactly like your format
        setUsername(data.USERNAME || '');
        setUserId(data.USERID || null); // only if returned by your API
        setCompanyName(data.COMPANYNAME || '');
        setCompanyId(data.COMPANYID || null);
        setCompanyLogo(data.LOGO || null);
        setCompanyUrl(data.BASEURL || null);
        setCompanyData(data);

        // ✅ Save to AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify({ username: data.USERNAME }));
        await AsyncStorage.setItem("COMPANY_DATA", JSON.stringify(data));

        // ✅ Show success toast
        if (showToast) {
          showToast(`Welcome back, ${data.COMPANYNAME || username}!`, "success", 3000);
        }

        return true;
      } else {
        // ❌ Invalid response
        if (showToast) {
          showToast("Invalid credentials. Please try again.", "error", 4000);
        }
        return false;
      }
    } catch (error) {
      console.error("Login Error:", error);

      // ❌ Handle different error types with appropriate toasts
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        if (status === 401 || status === 403) {
          if (showToast) {
            showToast("Invalid username or password", "error", 4000);
          }
        } else if (status === 404) {
          if (showToast) {
            showToast("Login service not found. Please contact support.", "error", 4000);
          }
        } else if (status >= 500) {
          if (showToast) {
            showToast("Server error. Please try again later.", "error", 4000);
          }
        } else {
          if (showToast) {
            showToast(message || "Login failed. Please try again.", "error", 4000);
          }
        }
      } else if (error.request) {
        // Request made but no response received
        if (showToast) {
          showToast("Network error. Please check your connection.", "error", 4000);
        }
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        if (showToast) {
          showToast("Request timeout. Please try again.", "warning", 4000);
        }
      } else {
        // Something else happened
        if (showToast) {
          showToast("An unexpected error occurred. Please try again.", "error", 4000);
        }
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔓 Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("COMPANY_DATA");
      setUsername('');
      setUserId(null);
      setCompanyName('');
      setCompanyId(null);
      setCompanyData(null);

      // ✅ Show logout toast
      if (showToast) {
        showToast("Logged out successfully", "info", 2000);
      }
    } catch (error) {
      console.error("Logout Error:", error);
      if (showToast) {
        showToast("Error during logout", "error", 3000);
      }
    }
  };

  // 🧭 Load saved data on app start
  const loadStoredData = async () => {
    try {
      const stored = await AsyncStorage.getItem("COMPANY_DATA");
      if (stored) {
        const data = JSON.parse(stored);
        setUsername(data.USERNAME || '');
        setUserId(data.USERID || null);
        setCompanyName(data.COMPANYNAME || '');
        setCompanyId(data.COMPANYID || null);
        setCompanyData(data);

        // ✅ Optional: Show restored session toast (comment out if too noisy)
        // if (showToast) {
        //   showToast("Session restored", "info", 2000);
        // }
      }
    } catch (err) {
      console.error("Error loading stored login data:", err);
      if (showToast) {
        showToast("Error loading saved session", "warning", 3000);
      }
    }
  };

  useEffect(() => {
    loadStoredData();
  }, []);

  return (
    <LoginContext.Provider
      value={{
        username,
        setUsername,
        userId,
        setUserId,
        companyName,
        setCompanyName,
        companyLogo,
        setCompanyLogo,
        companyUrl,
        setCompanyUrl, 
        companyId,
        setCompanyId,
        companyData,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

