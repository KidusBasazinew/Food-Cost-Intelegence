import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { employees } from "../mock/employees";

const AuthContext = createContext(null);
const STORAGE_KEY = "auth_employee_id";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      const savedId = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const found = employees.find((e) => e.id === savedId && e.isActive);
        if (found) setUser(found);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (pin) => {
    const match = employees.find((e) => e.pinCode === pin && e.isActive);
    if (!match) return { success: false, error: "Invalid PIN" };
    await AsyncStorage.setItem(STORAGE_KEY, match.id);
    setUser(match);
    return { success: true, employee: match };
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
