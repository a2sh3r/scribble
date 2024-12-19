import React, { useState, useRef } from "react";
import { arrow, buttonArrow } from "../assets/img";
import { putLike, downLike } from "../api";
import { useAuth } from "../contexts/AuthContext"; // Импортируем контекст авторизации
import { useNavigate } from "react-router-dom"; // Импортируем useNavigate

interface CardProps {
  title: string;
  subtitle: string;
  likes: number;
  content: string;
  tags: string[];
  id: number; // ID поста
  authorId: number; // ID автора
  initialLiked: boolean; // Новый пропс для начального состояния лайка
  authorName: string;
  date: string;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  likes,
  content,
  tags,
  id,
  authorId,
  initialLiked, // Используем новый пропс
  authorName,
  date,
}) => {
  const { data: user } = useAuth(); // Получаем данные пользователя из контекста
  const [likeCount, setLikeCount] = useState(likes);
  const [liked, setLiked] = useState(initialLiked); // Устанавливаем начальное состояние лайка
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Инициализируем navigate

  const handleLike = async () => {
    // Проверяем, авторизован ли пользователь
    if (!user || user.id === undefined) {
      alert("Вы должны быть авторизованы, чтобы ставить лайки."); // Показываем сообщение
      return; // Прерываем выполнение функции
    }

    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);

    console.log(
      `Лайк ${
        newLikedState ? "поставлен" : "снят"
      } для поста с ID: ${id} пользователем с ID: ${user.id}`
    );

    try {
      if (newLikedState) {
        await putLike(id.toString()); // Используем ID пользователя с оператором "!" для уверенности
      } else {
        await downLike(id.toString()); // Используем ID пользователя с оператором "!" для уверенности
      }
    } catch (error) {
      console.error("Ошибка при обработке лайка:", error);
    }
  };

  const handleButtonClick = () => {
    navigate(`/profile?id=${authorId}`); // Используем navigate для перехода к профилю автора
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEditClick = () => {
    navigate(`/edit?id=${id}`); // Используем navigate для перехода к редактированию поста
  };

  return (
    <div
      className="flex flex-col justify-start items-left w-[80vw] sm:w-[52vw] py-[3.21vw] sm:py-[2.09vw] px-[5.65vw] sm:px-[3.67vw] bg-secondary rounded-[3.47vw] sm:rounded-[2.26vw]"
      id={id.toString()} // Используем ID из пропсов
    >
      <p className="font-inter text-[2.77vw] sm:text-[1.8vw] font-semibold text-textPrimary mb-[1.04vw] sm:mb-[0.68vw]">
        {title}
      </p>
      <div
        className="w-full flex flex-row justify-between items-center 
      mb-[1.82vw] sm:mb-[1.18vw] font-inter text-[1.39vw] sm:text-[0.9vw] font-semibold text-textPrimary gap-[2.6vw] sm:gap-[1.69vw]"
      >
        <div className="">{subtitle}</div>
        {/* Теги */}
        <div className="flex flex-row gap-[1.04vw] sm:gap-[0.68vw]">
          {tags &&
            tags.map((tag, index) => (
              <div
                key={index}
                className="bg-primary px-[0.69vw] sm:px-[0.45vw] py-[0.28vw] sm:py-[0.18vw] rounded-[0.9vw] sm:rounded-[0.58vw]"
              >
                {tag}
              </div>
            ))}
        </div>
      </div>

      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[69.44vw] sm:max-h-[45.14vw]" : "max-h-[8.68vw] sm:max-h-[5.64vw]"
        }`}
      >
        <div
          className="font-inter text-[1.73vw] sm:text-[1.12vw] font-normal text-textPrimary mb-[1.39vw] sm:mb-[0.9vw]"
          dangerouslySetInnerHTML={{ __html: content }} // Используем dangerouslySetInnerHTML
        />
      </div>
      <div className="flex justify-start items-left gap-[0.69vw] sm:gap-[0.45vw] font-inter text-[1.73vw] sm:text-[1.12vw] font-normal text-textSecondary mb-[1.82vw] sm:mb-[1.18vw]">
        <img
          src={arrow}
          alt="toggle"
          className={`ml-[0.14vw] sm:ml-[0.09vw] transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
        <span className="underline cursor-pointer" onClick={toggleExpand}>
          {isExpanded ? "Свернуть" : "Развернуть"}
        </span>
      </div>

      <div className="flex flex-raw w-full justify-between items-center">
        <div className="flex justify-start items-center">
          <p className="font-inter text-[1.73vw] sm:text-[1.12vw] font-normal text-textSecondary border border-textSecondary rounded-[1.73vw] sm:rounded-[1.12vw] px-[0.86vw] sm:px-[0.56vw] py-[0.1vw] sm:py-[0.07vw]">
            {likeCount}
          </p>
          <svg
            width="2.6vw"
            height="2.6vw"
            viewBox="0 0 30 30"
            fill={liked ? "#00FF00" : "#707070"}
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleLike}
            className="w-[2.6vw] sm:w-[1.69vw] ml-[0.78vw] sm:ml-[0.51vw] cursor-pointer mb-[0.65vw] sm:mb-[0.42vw]"
          >
            <path d="M25.7703 9.7799H19.594V5.39084C19.594 3.28511 18.988 1.75655 17.7882 0.849562C15.9029 -0.583858 13.3381 0.221648 13.2279 0.259703C12.7933 0.39924 12.4934 0.824192 12.4934 1.29988V6.59593C12.4934 10.5156 8.04326 11.8793 7.8535 11.93C7.84126 11.9364 7.82901 11.9364 7.82289 11.9427L7.31483 12.1076C6.73944 11.5431 5.96817 11.2006 5.12344 11.2006H3.19527C1.43236 11.1943 0 12.6785 0 14.5051V25.8964C0 27.723 1.43236 29.2072 3.19527 29.2072H5.12344C5.93756 29.2072 6.68435 28.8901 7.2475 28.3636C8.0555 29.3594 9.2675 30 10.6203 30H23.132C26.0335 30 27.9616 28.3509 28.2983 25.5919L29.8531 15.4755L29.9388 14.9301C29.9755 14.6764 30 14.4163 30 14.1563C29.9939 11.7461 28.0963 9.7799 25.7703 9.7799ZM6.21914 25.9027C6.21914 26.5306 5.72944 27.038 5.12344 27.038H3.19527C2.58927 27.038 2.09957 26.5306 2.09957 25.9027V14.5051C2.09957 13.8772 2.58927 13.3698 3.19527 13.3698H5.12344C5.72944 13.3698 6.21914 13.8772 6.21914 14.5051V25.9027ZM27.8637 14.5939L26.2232 25.2748C26.2232 25.2875 26.2171 25.3002 26.2171 25.3128C26.1436 25.9344 25.9233 27.8308 23.132 27.8308H10.6203C9.35319 27.8308 8.31871 26.759 8.31871 25.446V14.5051C8.31871 14.3592 8.30647 14.2134 8.2881 14.0675L8.44113 14.0167C8.88798 13.8835 14.5929 12.0696 14.5929 6.58959V2.19419C15.1989 2.13076 15.9947 2.17516 16.5517 2.60645C17.1761 3.08849 17.4944 4.02085 17.4944 5.39084V10.8708C17.4944 11.4734 17.9657 11.9617 18.5472 11.9617H25.7703C26.9455 11.9617 27.8943 12.9512 27.8943 14.1626C27.8943 14.3021 27.8821 14.448 27.8637 14.5939Z" />
          </svg>

          {user &&
            user.id !== authorId && ( // Добавляем условие для проверки
              <div className="bg-gradient-custom-inverse rounded-[4.17vw] sm:rounded-[2.71vw] px-[0.1vw] sm:px-[0.065vw] py-[0.14vw] sm:py-[0.09vw] ml-[2.86vw] sm:ml-[1.86vw]">
                <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[4.17vw] sm:rounded-[2.71vw] px-[0.83vw] sm:px-[0.54vw] py-[0.69vw] sm:py-[0.45vw]">
                  <button
                    className="bg-clip-text text-transparent bg-gradient-custom-inverse
              text-[1.39vw] sm:text-[0.9vw] font-clashDisplay font-normal
              flex gap-[1.39vw] sm:gap-[0.9vw] items-center justify-center bg-bgRegCardBtn"
                    onClick={handleButtonClick}
                  >
                    {authorName}
                  </button>
                </div>
              </div>
            )}
          {/* Проверка на роль пользователя и ID автора */}
          {user && (user.role === "admin" || user.id === authorId) && (
            <div className="bg-gradient-custom-inverse rounded-[4.17vw] sm:rounded-[2.71vw] px-[0.1vw] sm:px-[0.065vw] py-[0.14vw] sm:py-[0.09vw] ml-[2.86vw] sm:ml-[1.86vw]">
              <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[4.17vw] sm:rounded-[2.71vw] px-[0.83vw] sm:px-[0.54vw] py-[0.69vw] sm:py-[0.45vw]">
                <button
                  className="bg-clip-text text-transparent bg-gradient-custom-inverse
              text-[1.39vw] sm:text-[0.9vw] font-clashDisplay font-normal
              flex gap-[1.39vw] sm:gap-[0.9vw] items-center justify-center bg-bgRegCardBtn"
                  onClick={handleEditClick}
                >
                  РЕДАКТИРОВАТЬ
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-row justify-center items-center ml-[5.2vw] sm:ml-[3.38vw]">
          <p className="font-inter text-[1.73vw] sm:text-[1.12vw] font-normal text-textSecondary">
            {date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
