import React, { useState } from "react";
import TextInput from "./TextInput";
import TagInput from "./TagInput";
import { Editor } from "@tinymce/tinymce-react";
import { savePost } from "../api";
import { NewPostRequest, NewPostResponse } from "../types";
import { useNavigate } from "react-router-dom";

const Post = () => {
  const [title, setTitle] = useState("");
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [subtitle, setSubtitle] = useState("");
  const [isValidSubtitle, setIsValidSubtitle] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");

  const navigate = useNavigate();

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsValidTitle(newTitle.length > 0 && newTitle.length <= 999);
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    setSubtitle(newSubtitle);
    setIsValidSubtitle(newSubtitle.length > 0 && newSubtitle.length <= 999);
  };

  const handleRegister = async () => {
    // Валидация полей
    if (!title.trim()) {
      console.error("Ошибка: Заголовок не может быть пустым.");
      alert("Пожалуйста, введите заголовок."); // Выводим сообщение пользователю
      return; // Прерываем выполнение функции
    }

    if (!subtitle.trim()) {
      console.error("Ошибка: Подзаголовок не может быть пустым.");
      alert("Пожалуйста, введите подзаголовок."); // Выводим сообщение пользователю
      return; // Прерываем выполнение функции
    }

    if (!content.trim()) {
      console.error("Ошибка: Содержимое не может быть пустым.");
      alert("Пожалуйста, введите содержимое."); // Выводим сообщение пользователю
      return; // Прерываем выполнение функции
    }

    try {
      console.log("Начинаем процесс сохранения поста...");

      const request: NewPostRequest = {
        title,
        subtitle,
        content,
        tags,
      };

      console.log("Данные поста для сохранения:", request);

      const response: NewPostResponse = await savePost(request);
      console.log("Ответ от сервера:", response);

      if (response.status) {
        console.log("Пост успешно сохранен с ID:", response.id);
        navigate(`/edit?id=${response.id}`);
      } else {
        console.error("Ошибка при сохранении поста:", response.message);
      }
    } catch (error) {
      console.error("Ошибка при сохранении поста:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start ">
      <div
        className="flex flex-col items-start justify-center mt-[3.33vw] w-[80vw] bg-secondary 
    py-[2.14vw] px-[4.79vw] gap-[1.67vw] rounded-[2.78vw]"
      >
        <div className="w-[29.38vw] gap-[1.67vw] flex flex-col">
          {/* Заголовок */}
          <TextInput
            title="Заголовок"
            text={title}
            setText={handleTitleChange}
            isValidText={isValidTitle}
          />
          {/* Подзаголовок */}
          <TextInput
            title="Подзаголовок"
            text={subtitle}
            setText={handleSubtitleChange}
            isValidText={isValidSubtitle}
          />
        </div>
        <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mt-[0.69vw]">
          Содержимое поста
        </p>
        {/* Редактор TinyMCE */}
        <Editor
          value={content}
          apiKey={import.meta.env.VITE_API_KEY}
          init={{
            language: "ru",
            max_height: 1000,
            height: 400,
            width: "100%",
            menubar: false,

            toolbar:
              "undo redo | styles | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image",
            content_style:
              "body { font-family: InterTight, sans-serif; font-size: 20px; background-color: #1a1a1a; color: #ffffff; direction: ltr; }",
            skin: "oxide-dark",
            content_css: "dark",
          }}
          onEditorChange={(newContent) => setContent(newContent)}
        />
        <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mt-[0.69vw]">
          Ключевые слова
        </p>
        {/* Ввод тегов */}
        <TagInput tags={tags} setTags={setTags} />
        <div className="flex flex-row justify-center items-center mt-[2.5vw]">
          {/* СОХРАНИТЬ */}
          <div className="bg-gradient-custom-inverse rounded-[2.78vw] px-[0.1vw] py-[0.14vw] ">
            <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.78vw] px-[0.83vw] py-[0.69vw]">
              <button
                className="bg-clip-text text-transparent bg-gradient-custom-inverse
              text-[1.11vw] font-clashDisplay font-normal
              flex gap-[1.11vw] items-center justify-center bg-bgRegCardBtn"
                onClick={handleRegister}
              >
                СОЗДАТЬ ПОСТ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
