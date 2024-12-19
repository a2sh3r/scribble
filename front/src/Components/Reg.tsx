import React, { useState } from "react";
import { buttonArrow } from "../assets/img";
import { Link, useNavigate } from "react-router-dom";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import NameInput from "./NameInput";
import { registerUser, registerWithCode } from "../api";
import TextInput from "./TextInput";

const Reg = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(password);
  const isValidName = /^[A-Za-z0-9\s\S]{2,999}$/.test(name);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Пожалуйста, заполните все поля.");
      return;
    }

    if (!isValidEmail) {
      setErrorMessage("Некорректный email.");
      return;
    }

    if (!isValidName) {
      setErrorMessage(
        "Имя должно содержать от 2 до 999 символов (латиница, цифры и любые символы)."
      );
      return;
    }

    if (!isValidPassword) {
      setErrorMessage(
        "Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Пароли не совпадают.");
      return;
    }

    const result = await registerUser(email, password, name);
    if (result.status === true) {
      setIsCodeSent(true);
    } else {
      setErrorMessage(result.message ?? "Неизвестная ошибка");
    }
  };

  const handleCodeSubmit = async () => {
    const result = await registerWithCode(code);
    if (result.status === true) {
      navigate("/");
    } else {
      setErrorMessage(result.message ?? "Неизвестная ошибка");
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
          Регистрация
        </p>
        {/* Имя  */}
        <NameInput name={name} setName={setName} disabled={isCodeSent} />
        {/* Почта */}
        <EmailInput
          email={email}
          setEmail={setEmail}
          isValidEmail={isValidEmail}
          disabled={isCodeSent}
        />
        {/* Пароль */}
        <PasswordInput
          password={password}
          setPassword={setPassword}
          disabled={isCodeSent}
        />
        <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mt-[0.83vw]">
          Подтвердите пароль
        </p>
        {/* Подтверждение пароля */}
        <PasswordInput
          password={confirmPassword}
          setPassword={setConfirmPassword}
          disabled={isCodeSent}
        />

        {errorMessage && (
          <div className="text-red-500 text-[1.04vw] mt-[0.69vw]">
            {errorMessage}
          </div>
        )}

        {isCodeSent && (
          <>
            <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mb-[1.39vw] mt-[1.39vw]">
              Введите код, отправленный на почту
            </p>
            <TextInput
              text={code}
              setText={setCode}
              isValidText={code.length > 0}
              title="Код"
              disabled={false}
            />

            <div className="bg-gradient-custom-inverse rounded-[2.08vw] px-[0.1vw] py-[0.14vw] mt-[2.22vw]">
              <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.08vw] px-[0.83vw] py-[0.69vw]">
                <button
                  className="bg-clip-text text-transparent bg-gradient-custom-inverse
        text-[1.11vw] font-clashDisplay font-normal
        flex gap-[1.11vw] items-center justify-center bg-bgRegCardBtn"
                  onClick={handleCodeSubmit}
                >
                  Подтвердить код
                  <img
                    src={buttonArrow}
                    alt="buttonArrow"
                    className="w-[1.88vw]"
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {!isCodeSent && (
          <div className="bg-gradient-custom-inverse rounded-[2.08vw] px-[0.1vw] py-[0.14vw] mt-[2.22vw]">
            <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.08vw] px-[0.83vw] py-[0.69vw]">
              <button
                className="bg-clip-text text-transparent bg-gradient-custom-inverse
        text-[1.11vw] font-clashDisplay font-normal
        flex gap-[1.11vw] items-center justify-center bg-bgRegCardBtn"
                onClick={handleRegister}
              >
                ОТПРАВИТЬ
                <img
                  src={buttonArrow}
                  alt="buttonArrow"
                  className="w-[1.88vw]"
                />
              </button>
            </div>
          </div>
        )}

        <Link
          to="/reg"
          className="text-textPrimary text-[1.39vw] font-interTight font-normal mt-[1.46vw] underline underline-offset-4"
          onClick={(e) => e.stopPropagation()}
        >
          Забыли пароль?
        </Link>
      </div>
    </div>
  );
};

export default Reg;
