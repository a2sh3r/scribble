import React, { useState } from "react";
import arrow from "../assets/img/arrow.svg"; // Импортируйте иконку
import { useAuth } from "../contexts/AuthContext";

const TitlePage = () => {
  const [visibleStories, setVisibleStories] = useState([false, false, false]);

  const toggleVisibility = (index: number) => {
    setVisibleStories((prev) => {
      const newVisibleStories = [...prev];
      newVisibleStories[index] = !newVisibleStories[index];
      return newVisibleStories;
    });
  };

  return (
    <div className="flex-col flex items-center justify-center h-full">
      <h1 className="text-[4vw] sm:text-[5vw] md:text-[4vw] lg:text-[3vw] xl:text-[2vw] font-light text-textPrimary mb-[2vw]">
        Где каждая статья имеет значение!
      </h1>

      <div
        className="flex flex-col justify-center items-center p-[5vw]
      gap-[3vw]
      rounded-[4.17vw] w-[80vw] 
      backdrop-blur-[6px]"
      >
        {/* Первая история */}
        <div className="flex flex-col justify-center items-center sm:w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
          <div className="flex flex-row justify-between items-center w-full">
            <h2 className="sm:text-[4vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[2vw] font-medium text-textPrimary font-interTight">
              Было ли что-то неправильное в том, чтобы ходить на свидания?
            </h2>
            <button
              onClick={() => toggleVisibility(0)}
              className="flex items-center"
            >
              <img
                src={arrow}
                alt="Toggle"
                className={`w-[2vw] transition-transform ml-[2vw] ${
                  visibleStories[0] ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          <hr
            className={`transition-all duration-600 ${
              visibleStories[0] ? "max-h-0" : "max-h-0.14vw"
            }`}
          />
          <div
            className={`mt-2 transition-all duration-600 ${
              visibleStories[0] ? "max-h-40" : "max-h-0 overflow-hidden"
            }`}
          >
            <p
              className={`text-textSecondary font-interTight font-normal text-[1.5vw] ${
                visibleStories[0] ? "block" : "hidden"
              }`}
            >
              История о том, как я должен скорбеть, пока не станет консулом.
              Биографические данные Европейского суда по правам человека
              (euismod) не подтвердят смерть Амета Маттиса...
            </p>
          </div>
          <div className="w-full h-[0.07vw] bg-[#404040] mt-[0.69vw]"></div>
        </div>

        {/* Вторая история */}
        <div className="flex flex-col justify-center items-center sm:w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
          <div className="flex flex-row justify-between items-center w-full">
            <h2 className="sm:text-[4vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[2vw] font-medium text-textPrimary font-interTight">
              Как справиться с потерей?
            </h2>
            <button
              onClick={() => toggleVisibility(1)}
              className="flex items-center"
            >
              <img
                src={arrow}
                alt="Toggle"
                className={`w-[2vw] transition-transform ml-[2vw] ${
                  visibleStories[1] ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          <hr
            className={`transition-all duration-600 ${
              visibleStories[1] ? "max-h-0" : "max-h-0.14vw"
            }`}
          />
          <div
            className={`mt-2 transition-all duration-600 ${
              visibleStories[1] ? "max-h-40" : "max-h-0 overflow-hidden"
            }`}
          >
            <p
              className={`text-textSecondary font-interTight font-normal text-[1.5vw] ${
                visibleStories[1] ? "block" : "hidden"
              }`}
            >
              Потеря может быть тяжелым испытанием. Важно помнить, что время
              лечит, и поддержка друзей и семьи может помочь...
            </p>
          </div>
          <div className="w-full h-[0.07vw] bg-[#404040] mt-[0.69vw]"></div>
        </div>

        {/* Третья история */}
        <div className="flex flex-col justify-center items-center sm:w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
          <div className="flex flex-row justify-between items-center w-full">
            <h2 className="sm:text-[4vw] md:text-[3vw] lg:text-[2.5vw] xl:text-[2vw] font-medium text-textPrimary font-interTight">
              Как найти свое призвание?
            </h2>
            <button
              onClick={() => toggleVisibility(2)}
              className="flex items-center"
            >
              <img
                src={arrow}
                alt="Toggle"
                className={`w-[2vw] transition-transform ml-[2vw]${
                  visibleStories[2] ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          <hr
            className={`transition-all duration-600 ${
              visibleStories[2] ? "max-h-0" : "max-h-0.14vw"
            }`}
          />
          <div
            className={`mt-2 transition-all duration-600 ${
              visibleStories[2] ? "max-h-40" : "max-h-0 overflow-hidden"
            }`}
          >
            <p
              className={`text-textSecondary font-interTight font-normal text-[1.5vw] ${
                visibleStories[2] ? "block" : "hidden"
              }`}
            >
              Найти свое призвание — это путешествие. Важно исследовать свои
              интересы и не бояться пробовать новое...
            </p>
          </div>
          <div className="w-full h-[0.07vw] bg-[#404040] mt-[0.69vw]"></div>
        </div>
      </div>

      <a
        href="/feed"
        className="text-[1.39vw] font-interTight font-normal text-textPrimary underline"
      >
        Читать еще
      </a>
    </div>
  );
};

export default TitlePage;
