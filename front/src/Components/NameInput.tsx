import React, { useState } from 'react';

interface NameInputProps {
  name: string; // Пропс для значения имени
  setName: (name: string) => void; // Функция для обновления имени
  disabled?: boolean; // Новый пропс для блокировки ввода
}

const NameInput: React.FC<NameInputProps> = ({ name, setName, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value); // Обновляем имя в родительском компоненте
  };

  return (
    <div className="relative w-full">
      <div className={`text-textSecondary pointer-events-none text-[1.39vw] font-interTight font-normal absolute top-[2.08vw] left-[0.83vw] ${isFocused || name.length > 0 ? 'hidden' : ''}`}>
        Имя
      </div>
      <input
        type="text"
        value={name}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={`w-full border-solid border-textPrimary border-[0.08vw]
          bg-primary rounded-[0.9vw] h-[4.44vw] mt-[1.46vw] text-textPrimary px-[0.83vw] text-[1.39vw] font-interTight font-normal ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
};

export default NameInput; 