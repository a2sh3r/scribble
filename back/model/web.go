package model

type WebConfig struct {
	APPIP   string `envconfig:"APP_IP" default:"localhost"` // IP адрес приложения
	APPPORT string `envconfig:"APP_PORT" default:"8080"`    // Порт приложения

	APPURL            string `envconfig:"APP_URL" default:"http://localhost:8080"` // URL приложения
	APPJWTSecret      string `envconfig:"APP_JWT_SECRET" required:"true"`          // Секретный ключ для JWT
	NumberRepetitions int    `envconfig:"APP_NUMBER_OF_REPETITIONS" default:"15"`  // Количество повторов запроса на замену-перенос
	RepeatPause       int    `envconfig:"APP_REPEAT_PAUSE" default:"15"`           // Пауза между повторами запроса на замену-перенос

	JWTTokenPassword string `envconfig:"JWT_TOKEN_PASSWORD" required:"true"` // Пароль для шифрования JWT токена
}

// Response представляет стандартный ответ
type Response struct {
	Status  bool   `json:"status"`  // Статус ответа
	Message string `json:"message"` // Описание ответа
}

type LoginResponse struct {
	Response
	Role string `json:"role"` // Роль пользователя
	Name string `json:"name"` // Имя пользователя
	ID   uint   `json:"id"`   // ID пользователя
}

type RoleResponse struct {
	Response
	Role string `json:"role"` // Роль пользователя
	Name string `json:"name"` // Имя пользователя
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type CodeRequest struct {
	Code string `json:"code"`
}

type EmailRequest struct {
	Email string `json:"email"`
}

type PasswordRequest struct {
	Password string `json:"password"`
}

type EmailPasswordRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type NewPostRequest struct {
	Title    string   `json:"title"`
	SubTitle string   `json:"subtitle"`
	Content  string   `json:"content"`
	Tags     []string `json:"tags"`
}

type NewPostResponse struct {
	Response
	ID uint `json:"id"`
}

type PostJson struct {
	ID       uint     `json:"id"`
	Title    string   `json:"title"`
	SubTitle string   `json:"subtitle"`
	Content  string   `json:"content"`
	Tags     []string `json:"tags"`
}

type GetPostRequest struct {
	ID uint `json:"id"`
}

type GetPostResponse struct {
	Status  bool     `json:"status"`
	Message string   `json:"message"`
	CanEdit bool     `json:"canEdit"`
	Post    PostJson `json:"post"`
}

type DeletePostRequest struct {
	ID uint `json:"id"`
}

type DeletePostResponse struct {
	Response
}

type UpdatePostRequest struct {
	Post PostJson `json:"post"`
}

type UpdatePostResponse struct {
	Response
}

// Пост для списка постов
type PostForFeed struct {
	Title        string   `json:"title"`
	SubTitle     string   `json:"subtitle"`
	AuthorName   string   `json:"authorName"`   // Имя автора
	Likes        int      `json:"likes"`        // Количество лайков
	Content      string   `json:"content"`      // Содержание статьи
	Tags         []string `json:"tags"`         // Теги статьи. Собрать и переделать в слайс
	ID           uint     `json:"id"`           // ID статьи
	AuthorId     uint     `json:"authorId"`     // ID автора
	InitialLiked bool     `json:"initialLiked"` // Лайкнул ли пользователь статью ID из запроса
	Date         string   `json:"date"`         // Дата публикации
}

// Запрос на получение всех постов
type GetAllPostsRequest struct {
	ID uint `json:"id"` // ID автора
}

// Ответ на запрос получения всех постов
type GetAllPostsResponse struct {
	Status  bool          `json:"status"`
	Message string        `json:"message"`
	Posts   []PostForFeed `json:"posts"`
}

// Запрос на постановку/снятие лайка
type LikeRequest struct {
	PostID string `json:"postID"`
}

type LikeResponse struct {
	Response
}

type SetPasswordRequest struct {
	Password string `json:"password"`
}

type SetPasswordResponse struct {
	Response
}
