import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LikeRequest,
  LikeResponse,
  Response,
  UserResponse,
  CodeRequest,
  NewPostRequest,
  NewPostResponse,
  GetPostRequest,
  DeletePostRequest,
  DeletePostResponse,
  GetPostResponse,
  UpdatePostRequest,
  UpdatePostResponse,
  GetAllPostsRequest,
  GetAllPostsResponse,
  ProfileRequest,
  ProfileResponse,
  SetPasswordRequest,
  SetPasswordResponse,
} from "./types";
import axios from "axios";

// Обработка ответа
const handleResponse = (
  response: any
): Response | UserResponse | NewPostResponse => {
  try {
    // Проверяем и пытаемся распарсить структуру
    const parsedData: Response | UserResponse | NewPostResponse = response.data;

    // Проверяем статус и возвращаем соответствующий результат
    if (parsedData.status !== undefined) {
      return parsedData; // Возвращаем распарсенные данные
    }
  } catch (error) {
    console.error("Ошибка при парсинге данных:", error); // Логируем ошибку парсинга
  }

  // Возвращаем стандартную структу с ошибкой в случае любых проблем
  return {
    status: false,
    message: `Ошибка: ${response.status || "Неизвестный код ошибки"}`, // Возвращаем код ошибки
  } as Response;
};

// Метод для выхода из аккаунта
export const logout = async (): Promise<Response> => {
  try {
    const response = await axios.post("/api/logout");
    console.log("Logout response:", response); // Логируем ответ от сервера
    return handleResponse(response); // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при выходе из аккаунта:", error);
    if (error.response) {
      console.error(
        "Error response from server during logout:",
        error.response
      ); // Логируем ответ сервера
      return handleResponse(error.response); // Обрабатываем ответ
    }
    return { status: false, message: `Ошибка: ${error.message}` };
  }
};

// Вход пользователя
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  console.log("Login attempt with email:", email); // Логируем попытку входа с email
  try {
    const response = await axios.post<LoginResponse>("/api/login", {
      email,
      password,
    } as LoginRequest);

    console.log("Response received from login API:", response); // Логируем ответ от API

    // Обрабатываем ответ через handleResponse
    return handleResponse(response);
  } catch (error: any) {
    console.error("Техническая ошибка при входе:", error); // Логируем техническую ошибку

    // Пытаемся обработать ошибку как бычный ответ
    if (error.response) {
      console.error("Error response from server:", error.response); // Логируем ответ сервера
      return handleResponse(error.response);
    }

    // Если обработать ошибку как ответ не удалось, возвращаем стандартную структуру
    return {
      status: false,
      message: `Ошибка: ${error.message || "Неизвестная ошибка"}`,
    };
  }
};

// Метод для отправки запроса на подтверждение кода
export const registerWithCode = async (code: string): Promise<Response> => {
  try {
    const response = await axios.post<Response>("/api/code-confirm", {
      code,
    });
    return handleResponse(response);
  } catch (error: any) {
    console.error("Техническая ошибка при регистрации с кодом:", error);
    if (error.response) {
      return handleResponse(error.response);
    }
    return { status: false, message: `Ошибка: ${error.message}` };
  }
};

// Регистрация пользователя
export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>("/api/reg", {
      email,
      password,
      name,
    } as RegisterRequest);
    return handleResponse(response);
  } catch (error: any) {
    console.error("Техническая ошибка:", error);
    if (error.response) {
      return handleResponse(error.response);
    }
    return { status: false, message: `Ошибка: ${error.message}` };
  }
};

// Постановка лайка
export const putLike = async (postID: string): Promise<LikeResponse> => {
  try {
    const response = await axios.post<LikeResponse>("/api/put-like", {
      postID,
    } as LikeRequest);
    return handleResponse(response);
  } catch (error: any) {
    console.error("Техническая ошибка при постановке лайка:", error);
    if (error.response) {
      return handleResponse(error.response);
    }
    return { status: false, message: `Ошибка: ${error.message}` };
  }
};

// Снятие лайка
export const downLike = async (postID: string): Promise<LikeResponse> => {
  try {
    const response = await axios.post<LikeResponse>("/api/down-like", {
      postID,
    } as LikeRequest);
    return handleResponse(response);
  } catch (error: any) {
    console.error("Техническая ошибка при снятии лайка:", error);
    if (error.response) {
      return handleResponse(error.response);
    }
    return { status: false, message: `Ошибка: ${error.message}` };
  }
};

// Сохранение поста
export const savePost = async (
  post: NewPostRequest
): Promise<NewPostResponse> => {
  try {
    const response = await axios.post("/api/new-post", post);
    return handleResponse(response) as NewPostResponse;
  } catch (error: any) {
    console.error("Ошибка при сохранении поста:", error);
    if (error.response) {
      return handleResponse(error.response) as NewPostResponse;
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
    } as NewPostResponse;
  }
};

// Авторизация пользователя
export const authorizeUser = async (): Promise<UserResponse> => {
  console.log("Attempting to authorize user..."); // Логируем попытку авторизации
  try {
    const response = await axios.post("/api/jwt-login");

    // спользуем обработчик ответа
    return handleResponse(response) as UserResponse;
  } catch (error: any) {
    console.error("Ошибка при авторизации:", error); // Логируем ошибку
    if (error.response) {
      console.error(
        "Error response from server during authorization:",
        error.response
      ); // Логируем ответ сервера
      return handleResponse(error.response) as UserResponse;
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
    } as UserResponse;
  }
};

// Запрос на получение одного поста
export const getPost = async (
  request: GetPostRequest
): Promise<GetPostResponse> => {
  try {
    const response = await axios.post(`/api/get-post`, request); // Отправляем данные в теле POST-запроса
    return handleResponse(response) as GetPostResponse; // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при получении поста:", error);
    if (error.response) {
      return handleResponse(error.response) as GetPostResponse; // Обрабатываем ответ
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
      post: null,
    } as GetPostResponse;
  }
};

// Запрос на удаление поста
export const deletePost = async (
  request: DeletePostRequest
): Promise<DeletePostResponse> => {
  try {
    const response = await axios.post(`/api/delete-post`, request); // Отправляем данные в теле POST-запроса
    return handleResponse(response) as DeletePostResponse; // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при удалении поста:", error);
    if (error.response) {
      return handleResponse(error.response) as DeletePostResponse; // Обрабатываем ответ
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
    } as DeletePostResponse;
  }
};

// Запрос на обновление данных поста
export const updatePost = async (
  request: UpdatePostRequest
): Promise<UpdatePostResponse> => {
  try {
    const response = await axios.post(
      `/api/update-post`, // Отправляем POST-запрос по новому адресу
      request // Отправляем данные поста в теле запроса
    );
    return handleResponse(response) as UpdatePostResponse; // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при обновлении поста:", error);
    if (error.response) {
      return handleResponse(error.response) as UpdatePostResponse; // Обрабатываем ответ
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
    } as UpdatePostResponse;
  }
};

// Запрос на получение всех постов
export const getAllPosts = async (
  request: GetAllPostsRequest
): Promise<GetAllPostsResponse> => {
  try {
    const response = await axios.post<GetAllPostsResponse>(
      "/api/get-all-posts",
      request
    );
    return handleResponse(response) as GetAllPostsResponse; // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при получении всех постов:", error);
    if (error.response) {
      return handleResponse(error.response) as GetAllPostsResponse; // Обрабатываем ответ
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
      posts: [],
    } as GetAllPostsResponse;
  }
};

// Запрос на получение всех постов
export const getAllMyPosts = async (
  request: GetAllPostsRequest
): Promise<GetAllPostsResponse> => {
  try {
    const response = await axios.post<GetAllPostsResponse>(
      "/api/get-all-my-posts",
      request
    );
    return handleResponse(response) as GetAllPostsResponse; // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при получении всех постов:", error);
    if (error.response) {
      return handleResponse(error.response) as GetAllPostsResponse; // Обрабатываем ответ
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
      posts: [],
    } as GetAllPostsResponse;
  }
};

// Запрос на получение имени пользователя по ID
export const getUserNameById = async (
  request: ProfileRequest
): Promise<ProfileResponse> => {
  try {
    const response = await axios.post<ProfileRequest>(
      "/api/get-user-profile",
      request
    ); // Отправляем POST-запрос
    return handleResponse(response) as ProfileResponse; // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при получении имени пользователя:", error);
    if (error.response) {
      return handleResponse(error.response) as ProfileResponse; // Обрабатываем ответ
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
    } as ProfileResponse; // Возвращаем стандартную структуру
  }
};

// Запрос на изменение пароля пользователя
export const setUserPassword = async (
  request: SetPasswordRequest
): Promise<SetPasswordResponse> => {
  try {
    const response = await axios.post<SetPasswordResponse>(
      "/api/set-password",
      request
    ); // Отправляем POST-запрос
    return handleResponse(response) as SetPasswordResponse; // Обрабатываем ответ
  } catch (error: any) {
    console.error("Ошибка при изменении пароля пользователя:", error);
    if (error.response) {
      return handleResponse(error.response) as SetPasswordResponse; // Обрабатываем ответ
    }
    return {
      status: false,
      message: `Ошибка: ${error.message}`,
    } as SetPasswordResponse; // Возвращаем стандартную структуру
  }
};
