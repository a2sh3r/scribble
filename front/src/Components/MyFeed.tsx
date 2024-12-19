import React, { useEffect, useState } from "react";
import Card from "./Card";
import { getAllMyPosts } from "../api"; // Импортируем функцию для получения постов пользователя
import {
  GetAllPostsRequest,
  GetAllPostsResponse,
  PostForFeed,
  Author,
} from "../types"; // Импортируем типы
import { useAuth } from "../contexts/AuthContext"; // Импортируем контекст авторизации
import TextInput from "./TextInput";
import { arrow } from "../assets/img";
import TagInput from "./TagInput";
import SingleSelect from "./SingleSelect";

const MyFeed = () => {
  const { data: user } = useAuth(); // Получаем данные пользователя из контекста
  const [posts, setPosts] = useState<PostForFeed[]>([]); // Состояние для хранения постов
  const [filteredPosts, setFilteredPosts] = useState<PostForFeed[]>([]); // Состояние для хранения отфильтрованных постов
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [search, setSearch] = useState(""); // Состояние для хранения текста поиска
  const [isExpanded, setIsExpanded] = useState(false); // Состояние для управления видимостью

  const [tags, setTags] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null); // Состояние для выбранного автора
  const [startDate, setStartDate] = useState<string>(""); // Состояние для даты "От"
  const [endDate, setEndDate] = useState<string>(""); // Состояние для даты "До"
  const [authors, setAuthors] = useState<Author[]>([]); // Состояние для хранения авторов

  const isValidSearch = search.length <= 999; // Валидация: ограничение до 999 символов

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || user.id === undefined) {
        console.error("Пользователь не авторизован или ID отсутствует");
        setLoading(false);
        return;
      }

      const request: GetAllPostsRequest = { id: user.id }; // Используем ID автора из контекста
      const response: GetAllPostsResponse = await getAllMyPosts(request);
      console.log(response);
      if (response.status) {
        setPosts(response.posts); // Устанавливаем полученные посты
        setFilteredPosts(response.posts); // Инициализируем отфильтрованные посты

        // Собираем уникальных авторов из постов
        const uniqueAuthors = Array.from(
          new Set(response.posts.map((post) => post.authorId))
        ).map((id) => {
          const post = response.posts.find((post) => post.authorId === id);
          return { ID: id, Name: post?.authorName || "Неизвестный автор" };
        });

        setAuthors(uniqueAuthors);
      } else {
        console.error("Ошибка при получении постов:", response.message);
      }
      setLoading(false); // Устанавливаем состояние загрузки в false
    };

    fetchPosts();
  }, [user]); // Добавляем user в зависимости

  const handleSearch = () => {
    console.log("Начало фильтрации");
    console.log("Выбранный автор:", selectedAuthor);
    console.log("Теги:", tags);
    console.log("Дата от:", startDate);
    console.log("Дата до:", endDate);
    console.log("Текст поиска:", search);

    const searchRegex = new RegExp(search, "i"); // Регулярное выражение для поиска без учета регистра

    const filtered = posts.filter((post) => {
      console.log("Проверка поста:", post);

      const matchesAuthor = selectedAuthor ? post.authorId === selectedAuthor.ID : true;
      console.log("Совпадение по автору:", matchesAuthor);

      const matchesTags = tags.length > 0 ? tags.some(tag => post.tags.includes(tag)) : true;
      console.log("Совпадение по тегам:", matchesTags);

      // Преобразуем строку даты в объект Date
      const dateParts = post.date.split('.');
      const postDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      console.log("Дата поста:", postDate);
      console.log("Начальная дата:", start);
      console.log("Конечная дата:", end);

      const matchesStartDate = start ? postDate >= start : true;
      const matchesEndDate = end ? postDate <= end : true;
      console.log("Совпадение по начальной дате:", matchesStartDate);
      console.log("Совпадение по конечной дате:", matchesEndDate);

      const matchesText = search ? searchRegex.test(post.title) || searchRegex.test(post.content) : true;
      console.log("Совпадение по тексту:", matchesText);

      return matchesAuthor && matchesTags && matchesStartDate && matchesEndDate && matchesText;
    });

    console.log("Отфильтрованные посты:", filtered);

    // Сортируем посты по количеству совпадающих тегов
    filtered.sort((a, b) => {
      const aTagMatches = tags.filter(tag => a.tags.includes(tag)).length;
      const bTagMatches = tags.filter(tag => b.tags.includes(tag)).length;
      return bTagMatches - aTagMatches;
    });

    const nonMatching = posts.filter(post => !filtered.includes(post));
    setFilteredPosts([...filtered, ...nonMatching]);
    console.log("Финальный список постов:", [...filtered, ...nonMatching]);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded); // Изменяем состояние видимости
  };

  if (loading) {
    return <div>Загрузка...</div>; // Отображаем индикатор загрузки
  }
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col w-full h-full justify-start items-center mt-[6.93vw] sm:mt-[4.5vw] gap-[3.64vw] sm:gap-[2.37vw] mb-[3.64vw] sm:mb-[2.37vw]">
        <h1 className="text-[2.75vw] sm:text-[1.79vw] font-bold font-inter text-textPrimary">
          Нет доступных постов
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full justify-start items-center mt-[6.93vw] sm:mt-[4.5vw] gap-[3.64vw] sm:gap-[2.37vw]">
      <div className="w-[80vw] sm:w-[52vw] bg-secondary rounded-[3.46vw] sm:rounded-[2.25vw] py-[3.04vw] sm:py-[1.98vw] px-[3.04vw] sm:px-[1.98vw]">
        <div className="flex flex-row justify-between items-center w-full">
          <TextInput
            text={search}
            setText={setSearch}
            isValidText={isValidSearch}
            title="Поиск по содержимому статьи"
          />
          <div
            className="bg-gradient-custom-inverse rounded-[1.125vw] sm:rounded-[0.73vw] h-[5vw] sm:h-[3.25vw]
            flex items-center justify-center
            px-[0.175vw] sm:px-[0.11vw] py-[0.432vw] sm:py-[0.28vw]
            ml-[1.296vw] sm:ml-[0.84vw]"
          >
            <div
              className="bg-bgRegCardBtn rounded-[1.125vw] sm:rounded-[0.73vw] h-[4.7vw] sm:h-[3.06vw]
              flex justify-center items-center"
            >
              <button
                className="bg-clip-text text-transparent bg-gradient-custom-inverse
                text-[1.872vw] sm:text-[1.22vw] font-clashDisplay font-normal
                flex items-center justify-center bg-bgRegCardBtn
                mx-[1.296vw] sm:mx-[0.84vw]"
                onClick={handleSearch}
              >
                Поиск
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center w-full mt-[1.566vw] sm:mt-[1.02vw] relative">
          <div className="text-textPrimary text-[1.728vw] sm:text-[1.12vw] font-interTight font-normal">
            Дополнительные фильтры
          </div>
          <div className="flex justify-start items-left gap-[0.486vw] sm:gap-[0.32vw] font-inter text-[1.728vw] sm:text-[1.12vw] font-normal text-textSecondary mb-[1.242vw] sm:mb-[0.81vw]">
            <img
              src={arrow}
              alt="toggle"
              className={`ml-[0.175vw] sm:ml-[0.11vw] transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
            <span className="underline cursor-pointer" onClick={toggleExpand}>
              {isExpanded ? "Свернуть" : "Развернуть"}
            </span>
          </div>
        </div>
        {isExpanded && (
          <div className="flex flex-col w-full h-full justify-between items-start mt-[0.594vw] sm:mt-[0.39vw] gap-[0.594vw] sm:gap-[0.39vw]">
            {/* Ввод тегов */}
            <p className="text-textPrimary text-[1.728vw] sm:text-[1.12vw] font-interTight font-normal">
              Ключевые слова
            </p>
            <TagInput tags={tags} setTags={setTags} disabled={false} />
            <SingleSelect
              options={authors}
              selectedOption={selectedAuthor}
              onChange={setSelectedAuthor}
              placeholder="Выберите автора"
            />
            <p className="text-textPrimary text-[1.728vw] sm:text-[1.12vw] font-interTight font-normal">
              Фильтры по дате
            </p>
            <div className="flex flex-row justify-start items-center w-full gap-[1.908vw] sm:gap-[1.24vw]">
              <p className="text-textPrimary text-[1.728vw] sm:text-[1.12vw] font-interTight font-normal">
                От
              </p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-solid border-textPrimary border-[0.0054vw] sm:border-[0.0035vw] bg-primary 
                rounded-[1.125vw] sm:rounded-[0.73vw] h-[5.51vw] sm:h-[3.58vw] text-textPrimary px-[0.72vw] sm:px-[0.47vw] text-[1.728vw] sm:text-[1.12vw] font-interTight font-normal"
              />
              <p className="text-textPrimary text-[1.728vw] sm:text-[1.12vw] font-interTight font-normal">
                До
              </p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-solid border-textPrimary border-[0.0054vw] sm:border-[0.0035vw] bg-primary 
                rounded-[1.125vw] sm:rounded-[0.73vw] h-[5.51vw] sm:h-[3.58vw] text-textPrimary px-[0.72vw] sm:px-[0.47vw] text-[1.728vw] sm:text-[1.12vw] font-interTight font-normal"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full h-full justify-start items-center gap-[3.64vw] sm:gap-[2.37vw]">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            initialLiked={post.initialLiked}
            title={post.title}
            subtitle={post.subtitle}
            likes={post.likes}
            content={post.content}
            tags={post.tags}
            id={post.id}
            authorId={post.authorId}
            authorName={post.authorName}
            date={post.date}
          />
        ))}
      </div>
    </div>
  );
};

export default MyFeed;
