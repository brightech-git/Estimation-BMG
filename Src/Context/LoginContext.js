// LoginContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const LoginContext = createContext();

export const LoginProvider = ({ children, showToast }) => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyUrl, setCompanyUrl] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://app.bmgjewellers.com/api/v1/company/getByCredentials",
        { username, password },
        { timeout: 10000 }
      );

      if (response.status === 200 && response.data) {
        const data = response.data;

        setUsername(data.USERNAME || "");
        setUserId(data.USERID || null);
        setCompanyName(data.COMPANYNAME || "");
        setCompanyId(data.COMPANYID || null);
        setCompanyLogo(data.LOGO || null);
        setCompanyUrl(data.BASEURL || null);
        setCompanyLogoUrl(data.LOGOBASEURL || null);
        setCompanyData(data);

        await AsyncStorage.setItem("COMPANY_DATA", JSON.stringify(data));

        console.log("✅ Login stored:", data);

        showToast?.(`Welcome, ${data.COMPANYNAME || username}!`, "success", 3000);
        return true;
      } else {
        showToast?.("Invalid credentials", "error", 3000);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast?.("Login failed. Please try again.", "error", 3000);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("COMPANY_DATA");

      setUsername("");
      setUserId(null);
      setCompanyName("");
      setCompanyId(null);
      setCompanyLogo(null);
      setCompanyUrl(null);
      setCompanyData(null);
      setCompanyLogoUrl(null);

      showToast?.("Logged out successfully", "info", 2000);
    } catch (error) {
      console.error("Logout error:", error);
      showToast?.("Logout error", "error", 3000);
    }
  };

  const loadStoredData = async () => {
    try {
      const stored = await AsyncStorage.getItem("COMPANY_DATA");
      if (stored) {
        const data = JSON.parse(stored);
        setUsername(data.USERNAME || "");
        setUserId(data.USERID || null);
        setCompanyName(data.COMPANYNAME || "");
        setCompanyId(data.COMPANYID || null);
        setCompanyLogo(data.LOGO || null);
        setCompanyUrl(data.BASEURL || null);
        setCompanyData(data);
        setCompanyLogoUrl(data.LOGOBASEURL || null);
        console.log("📦 Restored company data:", data);
      }
    } catch (err) {
      console.error("Error loading stored data:", err);
    } finally {
      setLoading(false);
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
        companyLogoUrl,
        setCompanyLogoUrl,
        companyId,
        setCompanyId,
        companyData,
        setCompanyData,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
