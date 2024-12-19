import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../api";

const Nav = () => {
  const { data, loading, error } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.status) {
      console.log("Выход выполнен успешно");
      window.location.href = "/";
    } else {
      console.error("Ошибка при выходе:", result.message);
    }
  };

  return (
    <div className="flex flex-row justify-center items-center h-[7.64vw]">
      <div
        className="flex flex-row items-center justify-between w-full 
       sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[84.72vw]"
      >
        <Link
          to="/"
          className="font-clashDisplay font-semibold text-white
           sm:text-[3.5vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[2.22vw]"
        >
          Scribble
        </Link>

        <div
          className="flex flex-row items-center text-white font-interTight font-normal
        gap-[2.78vw]
        sm:text-[4vw] md:text-[2.5vw] lg:text-[1.8vw] xl:text-[1.39vw]"
        >
          {loading ? (
            <span className="text-white">Загрузка...</span>
          ) : data ? (
            <>
              <Link to="/feed" className="bg-clip-text text-white">
                Лента
              </Link>
              {data.role === "admin" ? (
                <>
                  <Link to="/profile" className="text-white">
                    Профиль
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/my-posts" className="text-white">
                    Мои посты
                  </Link>
                  <Link to="/post" className="text-white">
                    Создать пост
                  </Link>
                  <Link to="/profile" className="text-white">
                    Профиль
                  </Link>
                </>
              )}
              <Link
                to="/logout"
                className="text-[1.39vw] text-white font-interTight font-normal"
                onClick={handleLogout}
              >
                Выйти
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/feed"
                className={`bg-clip-text ${
                  location.pathname === "/feed"
                    ? "bg-gradient-custom text-transparent"
                    : "hover:text-transparent hover:bg-gradient-custom-inverse"
                }`}
              >
                Лента
              </Link>
              <Link
                to="/login"
                className={`bg-clip-text ${
                  location.pathname === "/login"
                    ? "bg-gradient-custom text-transparent"
                    : "hover:text-transparent hover:bg-gradient-custom-inverse"
                }`}
              >
                Вход
              </Link>
            </>
          )}
        </div>

        {/* Пустой div справа */}
        <div></div>
      </div>
    </div>
  );
};

export default Nav;
