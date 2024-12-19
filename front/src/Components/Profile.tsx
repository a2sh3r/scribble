import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import { useAuth } from "../contexts/AuthContext"; // Импортируем контекст авторизации
import { getUserNameById, setUserPassword } from "../api"; // Импортируем функции для получения имени пользователя и изменения пароля
import { ProfileRequest, ProfileResponse, SetPasswordRequest, SetPasswordResponse } from "../types";

const Profile = () => {
  const { data: user } = useAuth(); // Получаем данные пользователя из контекста
  const [name, setName] = useState<string>(user?.name || ""); // Ensure name is always a string
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const id = query.get("id");

  console.log("Profile component mounted");
  console.log("User:", user);
  console.log("ID from URL:", id);

  const isValidPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(password);

  useEffect(() => {
    const fetchUserName = async () => {
      if (id && user?.id?.toString() !== id) {
        const request: ProfileRequest = { id: Number(id) };
        const response: ProfileResponse = await getUserNameById(request);
        if (response.status) {
          setName(response.name);
        } else {
          setErrorMessage(response.message || "Ошибка при получении имени пользователя");
        }
      } else if (user) {
        setName(user.name || ""); // Ensure name is always a string
      }
    };

    fetchUserName();
  }, [user, id]);

  const handleUpdateProfile = async () => {
    setErrorMessage("");

    if (!name) {
      setErrorMessage("Пожалуйста, заполните имя.");
      return;
    }

    if (password && !isValidPassword) {
      setErrorMessage(
        "Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Пароли не совпадают.");
      return;
    }

    // Отправляем запрос на изменение пароля
    try {
      const request: SetPasswordRequest = { password };
      const response: SetPasswordResponse = await setUserPassword(request);
      if (response.status) {
        console.log("Пароль успешно изменен");
        navigate("/"); // Перенаправление после успешного обновления
      } else {
        setErrorMessage(response.message || "Ошибка при изменении пароля");
      }
    } catch (error) {
      setErrorMessage("Ошибка при изменении пароля");
      console.error("Ошибка при изменении пароля:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <div
        className="flex flex-col items-center justify-center
       bg-bgRegCard rounded-[2.08vw] w-[32.64vw] backdrop-blur-[6px]
       px-[4.79vw] py-[3.47vw] mt-[3.33vw]
       border-solid border-textPrimary border-[0.08vw]"
      >
        <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mb-[2.22vw]">
          Профиль пользователя
        </p>
        <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mb-[0.83vw]">
          {name}
        </p>

        {user && (!id || user.id?.toString() === id) && (
          <>
            <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mt-[1.39vw]">
              Сменить пароль
            </p>
            <PasswordInput
              password={password}
              setPassword={setPassword}
              disabled={false}
            />
            <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mt-[0.83vw]">
              Подтвердите новый пароль
            </p>
            <PasswordInput
              password={confirmPassword}
              setPassword={setConfirmPassword}
              disabled={false}
            />
          </>
        )}
        {errorMessage && (
          <div className="text-red-500 text-[1.04vw] mt-[0.69vw]">
            {errorMessage}
          </div>
        )}

        {(!id || user?.id?.toString() === id) && (
          <div className="bg-gradient-custom-inverse rounded-[2.08vw] px-[0.1vw] py-[0.14vw] mt-[2.22vw]">
            <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.08vw] px-[0.83vw] py-[0.69vw]">
              <button
                className="bg-clip-text text-transparent bg-gradient-custom-inverse
        text-[1.11vw] font-clashDisplay font-normal
        flex gap-[1.11vw] items-center justify-center bg-bgRegCardBtn"
                onClick={handleUpdateProfile}
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
