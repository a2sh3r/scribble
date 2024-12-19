import React, { useState } from 'react';

interface EmailInputProps {
  email: string; // Пропс для значения email
  setEmail: (email: string) => void; // Функция для обновления email
  isValidEmail: boolean; // Пропс для понимания валидности почты
  disabled?: boolean; // Новый пропс для блокировки ввода
}

const EmailInput: React.FC<EmailInputProps> = ({ email, setEmail, isValidEmail, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value); // Обновляем email в родительском компоненте
  };

  return (
    <div className="relative w-full">
      <div className={`text-textSecondary text-[1.39vw] pointer-events-none font-interTight font-normal absolute top-[2.08vw] left-[0.83vw] ${isFocused || email.length > 0 ? 'hidden' : ''}`}>
        Почта
      </div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={`w-full border-solid border-textPrimary border-[0.08vw] bg-primary rounded-[0.9vw] h-[4.44vw] mt-[1.46vw] text-textPrimary px-[0.83vw] text-[1.39vw] font-interTight font-normal ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {!isValidEmail && email && (
        <div className="text-red-500 text-[1.04vw]">Некорректный email</div>
      )}
    </div>
  );
};

export default EmailInput;
