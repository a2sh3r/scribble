import React, { createContext, useContext, useState, useEffect } from "react";
import { LoginResponse } from "../types";
import { authorizeUser } from "../api";

interface AuthContextType {
  data: LoginResponse | null;
  error: string | null;
  loading: boolean;
  authorize: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const authorize = async () => {
    console.log("Attempting to authorize user...");
    setLoading(true);
    try {
      const response = await authorizeUser();
      if (response.status) {
        setData(response);
        console.log("User authorized successfully:", response);
      } else {
        setError(response.message || "Ошибка при авторизации");
        setData(null);
        console.error("Authorization failed:", response.message);
      }
    } catch (err) {
      setError("Ошибка при авторизации");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; // Флаг для предотвращения двойного вызова

    if (isMounted) {
      authorize();
    }

    return () => {
      isMounted = false; // Очистка флага при размонтировании
    };
  }, []); // useEffect срабатывает только один раз

  return (
    <AuthContext.Provider value={{ data, error, loading, authorize }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
