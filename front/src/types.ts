export interface Response {
  status: boolean;
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  status: boolean;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message?: string;
  role?: string;
  name?: string;
  id?: number;
}

export interface LikeRequest {
  postID: string;
}

export interface CodeRequest {
  code: string;
}

export interface LikeResponse {
  status: boolean;
  message?: string;
}

export interface UserResponse {
  status: boolean;
  message?: string;
  role: string;
}

// Запрос на создание поста
export interface NewPostRequest {
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
}

// Ответ на создание поста
export interface NewPostResponse {
  status: boolean;
  message?: string;
  id: number;
}

// Пост
export interface Post {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
}

// Запрос на получение одного поста
export interface GetPostRequest {
  id: number;
}

// Ответ на запрос получения одного поста
export interface GetPostResponse {
  status: boolean;
  message?: string;
  canEdit: boolean;
  post: Post | null;
}

// Запрос на удаление поста
export interface DeletePostRequest {
  id: number;
}

// Ответ на удаление поста
export interface DeletePostResponse {
  status: boolean;
  message?: string;
}

// Запрос на обновление данных поста
export interface UpdatePostRequest {
  post: Post;
}

// Запрос на обновление данных поста
export interface UpdatePostResponse {
  status: boolean;
  message?: string;
}

// Пост для списка постов
export interface PostForFeed {
  title: string;
  subtitle: string;
  likes: number;
  content: string;
  tags: string[];
  date: string;
  authorName: string;
  id: number; // ID поста
  authorId: number; // ID автора
  initialLiked: boolean; // Новый пропс для начального состояния лайка
}

// Запрос на получение всех постов
export interface GetAllPostsRequest {
  id: number; // ID автора
}

// Ответ на запрос получения всех постов
export interface GetAllPostsResponse {
  status: boolean;
  message?: string;
  posts: PostForFeed[];
}

export interface ProfileRequest {
  id: number;
}

export interface ProfileResponse {
  status: boolean;
  message?: string;
  name: string;
}

export interface SetPasswordRequest {
  password: string;
}

export interface SetPasswordResponse {
  status: boolean;
  message?: string;
}

export interface Author {
  ID: number;
  Name: string;
}
