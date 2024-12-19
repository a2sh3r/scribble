import React, { useState } from "react";
import { buttonArrow } from "../assets/img";
import { Link, useNavigate } from "react-router-dom";
import EmailInput from "./EmailInput"; // Импортируем компонент для ввода email
import PasswordInput from "./PasswordInput"; // Импортируем компонент для ввода пароля
import { loginUser } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(password); // Минимум 8 символов, одна заглавная буква и одна цифра
  const navigate = useNavigate();
  const { authorize } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Пожалуйста, заполните все поля.");
      return;
    }

    const result = await loginUser(email, password);
    if (result.status) {
      // Успешный вход
      navigate("/"); // Переход на главную страницу
    } else {
      setErrorMessage(result.message || "Произошла ошибка при авторизации"); // Отображаем сообщение об ошибке
    }
    await authorize();
  };

  return (
    <div className="flex flex-col items-center justify-center full-height">
      <div
        className="flex flex-col items-center justify-center
       bg-bgRegCard rounded-[2.89vw] w-[45.33vw] backdrop-blur-[0.42vw]
       px-[6.65vw] py-[4.86vw]
       border-solid border-textPrimary border-[0.11vw]"
      >
        <p className="text-textPrimary text-[1.93vw] font-interTight font-normal mb-[3.2vw]">
          Авторизация
        </p>
        {/* Поле ввода почты */}
        <EmailInput
          email={email}
          setEmail={setEmail}
          isValidEmail={isValidEmail}
        />
        {/* Поле ввода пароля */}
        <PasswordInput password={password} setPassword={setPassword} />

        {errorMessage && (
          <div className="text-red-500 text-[1.44vw] mt-[0.96vw]">
            {errorMessage}
          </div>
        )}

        <div className="bg-gradient-custom-inverse rounded-[2.89vw] px-[0.14vw] py-[0.2vw] mt-[3.2vw]">
          <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.89vw] px-[1.15vw] py-[0.96vw]">
            <button
              className="bg-clip-text text-transparent bg-gradient-custom-inverse
            text-[1.54vw] font-clashDisplay font-normal
            flex gap-[1.54vw] items-center justify-center bg-bgRegCardBtn"
              onClick={handleLogin}
            >
              ВОЙТИ
              <img src={buttonArrow} alt="buttonArrow" className="w-[2.61vw]" />
            </button>
          </div>
        </div>

        <Link
          to="/register"
          className="text-textPrimary text-[1.93vw] font-interTight font-normal mt-[2.04vw] underline underline-offset-4"
        >
          Забыли пароль?
        </Link>
      </div>

      <div
        className="flex flex-col items-center justify-center
       bg-bgRegCard rounded-[2.89vw] w-[45.33vw] backdrop-blur-[0.42vw]
       px-[6.65vw] py-[4.86vw] mt-[4.67vw]
       border-solid border-textPrimary border-[0.11vw]"
      >
        <p className="text-textPrimary text-[1.93vw] font-interTight font-normal">
          Еще не зарегистрированны?
        </p>
        <div className="bg-gradient-custom-inverse rounded-[2.89vw] px-[0.14vw] py-[0.2vw] mt-[3.2vw]">
          <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.89vw] px-[1.15vw] py-[0.96vw]">
            <Link
              to="/reg"
              className="bg-clip-text text-transparent bg-gradient-custom-inverse
        text-[1.54vw] font-clashDisplay font-normal
        flex gap-[1.54vw] items-center justify-center bg-bgRegCardBtn"
            >
              РЕГИСТРАЦИЯ
              <img src={buttonArrow} alt="buttonArrow" className="w-[2.61vw]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
