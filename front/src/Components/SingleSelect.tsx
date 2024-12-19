import React, { useState, useEffect, useRef } from "react";
import { cross } from "../assets/img"; // Импортируем иконку крестика

interface SingleSelectProps<T> {
  selectedOption: T | null; // Один выбранный объект
  onChange: (selected: T | null) => void; // Обработчик изменения
  options: T[]; // Доступные варианты
  placeholder?: string; // Плейсхолдер
  disabled?: boolean; // Доступность
}

const SingleSelect = <T extends { ID: number; Name: string }>({
  selectedOption,
  onChange,
  options,
  placeholder = "Выберите вариант",
  disabled = false,
}: SingleSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие дропдауна при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectOption = (option: T) => {
    onChange(option); // Устанавливаем выбранный объект
    setIsOpen(false); // Закрываем дропдаун
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем распространение события
    onChange(null); // Сбрасываем выбранный объект
  };

  return (
    <div className="relative w-[49.51vw] sm:w-[32.18vw]" ref={dropdownRef}>
      {/* Поле выбора */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`h-[3.06vw] sm:h-[1.99vw] bg-inputBg font-geologica px-[1.11vw] sm:px-[0.72vw]
          text-[1.39vw] sm:text-[0.9vw] font-normal flex items-center cursor-pointer 
          w-[30vw] sm:w-[19.5vw] bg-primary border-solid border-textPrimary border-[0.08vw] sm:border-[0.052vw] rounded-[1.39vw] sm:rounded-[0.9vw]
          text-textPrimary
          overflow-hidden ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {selectedOption ? (
          <div className="flex items-center justify-between w-full">
            <span>{selectedOption.Name}</span>
            <button
              onClick={clearSelection}
              className="ml-[0.48vw] sm:ml-[0.31vw] flex items-center justify-center"
            >
              <img src={cross} alt="Очистить" className="w-[0.97vw] sm:w-[0.63vw]" />
            </button>
          </div>
        ) : (
          <span className="text-textPrimary">{placeholder}</span>
        )}
      </div>

      {/* Выпадающий список */}
      {isOpen && (
        <div
          className="absolute top-[3.30vw] sm:top-[2.15vw] left-0 w-full bg-secondary rounded-[1.39vw] sm:rounded-[0.9vw] shadow-lg z-50
        border-solid border-textPrimary border-[0.08vw] sm:border-[0.052vw] text-textPrimary
        text-[1.39vw] sm:text-[0.9vw]"
        >
          {/* Поиск */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-[0.5vw] sm:p-[0.325vw] py-[0.5vw] sm:py-[0.325vw] rounded-[1.39vw] sm:rounded-[0.9vw] font-interTight 
           bg-primary text-textPrimary mt-[0.14vw] sm:mt-[0.09vw]"
            placeholder="Поиск..."
            disabled={disabled}
          />

          {/* Список опций */}
          <div className="max-h-[20vw] sm:max-h-[13vw] overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.ID}
                onClick={() => !disabled && selectOption(option)}
                className={`p-[0.14vw] sm:p-[0.09vw] cursor-pointer hover:bg-inputBg font-geologica
                  ${
                    selectedOption?.ID === option.ID
                      ? "text-searchInput font-bold "
                      : ""
                  }`}
              >
                {option.Name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSelect;
