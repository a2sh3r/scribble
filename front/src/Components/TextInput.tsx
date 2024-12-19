import React, { useState } from 'react';

interface TextInputProps {
  text: string; // Пропс для значения текста
  setText: (text: string) => void; // Функция для обновления текста
  isValidText: boolean; // Пропс для понимания валидности текста
  title: string;
  disabled?: boolean; // Новый пропс для блокировки ввода
}

const TextInput: React.FC<TextInputProps> = ({ text, setText, isValidText, title, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value.slice(0, 999); // Ограничиваем длину текста до 999 символов
    setText(newText); // Обновляем текст в родительском компоненте
  };

  return (
    <div className="relative w-full">
      <div className={`text-textSecondary text-[1.39vw] pointer-events-none
         font-interTight font-normal absolute top-[0.69vw] left-[0.83vw] ${isFocused || text.length > 0 ? 'hidden' : ''}`}>
        {title}
      </div>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={`w-full border-solid border-textPrimary border-[0.08vw]
          bg-primary rounded-[0.9vw] h-[4.44vw] text-textPrimary px-[0.83vw] text-[1.39vw] font-interTight font-normal ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {!isValidText && text && (
        <div className="text-red-500 text-[1.04vw]">Некорректный заголовок</div>
      )}
    </div>
  );
};

export default TextInput; 