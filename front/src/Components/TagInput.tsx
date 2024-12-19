import React, { useState } from "react";
import { cross } from "../assets/img";

interface TagInputProps {
  tags: string[]; // Массив тегов
  setTags: (tags: string[]) => void; // Функция для обновления массива тегов
  disabled?: boolean; // Свойство для блокировки ввода
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    if (
      inputValue.trim() &&
      inputValue.length <= 100 &&
      !tags.includes(inputValue.trim())
    ) {
      setTags([...tags, inputValue.trim()]); // Добавляем новый тег
      setInputValue(""); // Очищаем поле ввода
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTag(); // Добавляем тег при нажатии Enter
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove)); // Удаляем тег
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-[1.04vw]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-solid border-textPrimary border-[0.08vw] bg-primary 
          rounded-[0.9vw] h-[4.44vw] text-textPrimary px-[0.83vw] text-[1.39vw] font-interTight font-normal
          w-[30vw]"
          placeholder="Введите и нажмите Enter"
          disabled={disabled} // Блокируем поле ввода
        />
        <div
          onClick={handleAddTag} // Добавляем обработчик для кнопки "ОК"
          className={`text-textPrimary text-[1.39vw] font-interTight font-normal
          cursor-pointer bg-primary h-[4.44vw] px-[1.04vw] rounded-[1.39vw]
          flex items-center justify-center border-solid border-textPrimary border-[0.08vw]
          hover:bg-primary hover:border-textSecondary ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ pointerEvents: disabled ? "none" : "auto" }} // Блокируем кнопку "ОК"
        >
          ОК
        </div>
      </div>

      <div className="flex flex-wrap gap-[0.69vw] mt-[1.67vw]">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-primary px-[0.69vw] py-[0.27vw] rounded-[0.9vw] text-textPrimary text-[1.67vw] font-normal"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-[0.69vw]"
            >
              <img src={cross} alt="delete tag" className="w-[1.39vw]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
