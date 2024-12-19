import React, { useEffect, useState } from "react";
import TextInput from "./TextInput";
import TagInput from "./TagInput";
import { Editor } from "@tinymce/tinymce-react";
import { getPost, updatePost, deletePost } from "../api";
import { GetPostRequest, GetPostResponse, UpdatePostRequest, UpdatePostResponse } from "../types";
import { useNavigate, useLocation } from "react-router-dom";

const EditPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const postId = Number(query.get("id")); 

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [isEdit, setIsEdit] = useState(true); // Устанавливаем состояние редактирования

  useEffect(() => {
    const fetchPost = async () => {
      const request: GetPostRequest = { id: postId };
      console.log("Запрос на получение поста с ID:", postId); // Логируем ID поста
      const response: GetPostResponse = await getPost(request);
      console.log("Получены данные запроса поста: ", response);
      if (response.status) {
        setTitle(response.post?.title || "");
        setSubtitle(response.post?.subtitle || "");
        setContent(response.post?.content || "");
        setTags(response.post?.tags || []);
        setIsEdit(response.canEdit); // Устанавливаем состояние редактирования
        console.log("Данные поста установлены:", { title, subtitle, content, tags }); // Логируем установленные данные
      } else {
        console.error(response.message || "Не удалось загрузить пост.");
      }
    };

    fetchPost();
  }, [postId]);

  const handleUpdate = async () => {
    const request: UpdatePostRequest = {
      post: {
        id: postId,
        title,
        subtitle,
        content,
        tags,
      },
    };
    console.log("Отправляем запрос на обновление поста:", request);
    const response: UpdatePostResponse = await updatePost(request);
    if (response.status) {
      console.log("Пост успешно обновлен");
      navigate(`/edit?id=${postId}`); // Перенаправление на страницу поста
    } else {
      console.error("Ошибка при обновлении поста:", response.message);
    }
  };

  const handleDelete = async () => {
    const request = { id: postId };
    const response = await deletePost(request);
    if (response.status) {
      console.log("Пост успешно удален");
      navigate("/"); // Перенаправление на главную страницу или список постов
    } else {
      console.error("Ошибка при удалении поста:", response.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start ">
      <div className="flex flex-col items-start justify-center mt-[3.33vw] w-[80vw] bg-secondary py-[2.14vw] px-[4.79vw] gap-[1.67vw] rounded-[2.78vw]">
        <div className="w-[29.38vw] gap-[1.67vw] flex flex-col">
          {/* Заголовок */}
          <TextInput
            title="Заголовок"
            text={title}
            setText={setTitle}
            isValidText={true}
            disabled={!isEdit} // Блокируем поле, если не в режиме редактирования
          />
          {/* Подзаголовок */}
          <TextInput
            title="Подзаголовок"
            text={subtitle}
            setText={setSubtitle}
            isValidText={true}
            disabled={!isEdit} // Блокируем поле, если не в режиме редактирования
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
          disabled={!isEdit} // Блокируем редактор, если не в режиме редактирования
        />
        <p className="text-textPrimary text-[1.39vw] font-interTight font-normal mt-[0.69vw]">
          Ключевые слова
        </p>
        {/* Ввод тегов */}
        <TagInput tags={tags} setTags={setTags} disabled={!isEdit} />
        <div className="flex flex-row justify-center items-center mt-[2.5vw]">
          {/* Кнопка редактирования */}
          {isEdit && (
            <div className="bg-gradient-custom-inverse rounded-[2.78vw] px-[0.1vw] py-[0.14vw] ">
              <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.78vw] px-[0.83vw] py-[0.69vw]">
                <button
                  className="bg-clip-text text-transparent bg-gradient-custom-inverse
                  text-[1.11vw] font-clashDisplay font-normal
                  flex gap-[1.11vw] items-center justify-center bg-bgRegCardBtn"
                  onClick={handleUpdate}
                >
                  РЕДАКТИРОВАТЬ
                </button>
              </div>
            </div>
          )}
          {/* Кнопка удаления */}
          {isEdit && (
            <div className="bg-gradient-custom-inverse rounded-[2.78vw] px-[0.1vw] py-[0.14vw] ml-[2.29vw]">
              <div className="bg-bgRegCardBtn flex items-center justify-center rounded-[2.78vw] px-[0.83vw] py-[0.69vw]">
                <button
                  className="bg-clip-text text-transparent bg-gradient-custom-inverse
                  text-[1.11vw] font-clashDisplay font-normal
                  flex gap-[1.11vw] items-center justify-center bg-bgRegCardBtn"
                  onClick={handleDelete}
                >
                  УДАЛИТЬ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPost;
