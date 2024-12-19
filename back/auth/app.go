// В данном пакеете реализуется бизнес-логика для авторизации и регистрации пользователей.
package auth

import (
	"app/cache"
	"app/config"
	"app/db"
	"app/log"
	"app/model"
	"app/smtp"
	"app/utils"
	"errors"
	"fmt"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"gorm.io/gorm"
)

// CreateJWTToken создает jwt токен для данных пользователя
func CreateJWTToken(user *model.User) (string, error) {
	// Структура токена
	tk := &model.Token{
		UserId:         user.ID,
		Role:           user.Role,
		StandardClaims: jwt.StandardClaims{},
	}

	// Создание токена из структуры "tk" с алгоритмом (HMAC-SHA256) для шифрования токена
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, tk)

	tokenString, err := token.SignedString([]byte(config.File.JWTTokenPassword))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ParseJWTToken разбирает JWT токен и возвращает данные пользователя
func ParseJWTToken(tokenString string) (*model.Token, error) {
	// Создаем экземпляр структуры Token для хранения данных из токена
	tk := &model.Token{}

	// Парсим токен с использованием секретного ключа
	token, err := jwt.ParseWithClaims(tokenString, tk, func(token *jwt.Token) (interface{}, error) {
		// Проверяем, что метод подписи токена соответствует ожидаемому
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(config.File.JWTTokenPassword), nil
	})

	if err != nil {
		return nil, err
	}

	// Проверяем, является ли токен действительным и содержит ли он ожидаемые данные
	if claims, ok := token.Claims.(*model.Token); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// CheckEmailAvailability проверяет, занята ли почта.
// Если true, то почта занята.
func CheckEmailAvailability(email string) error {
	temp := &model.User{}

	// Проверка на дубликат почты
	err := db.App.Where("email = ?", email).First(temp).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}

	return fmt.Errorf("Почта занята")
}

// Validate проверяет корректность пароля и почты
func Validate(user *model.User) error {
	// Проверка электронной почты
	err := utils.ValidateEmail(user.Email)
	if err != nil {
		return err
	}

	// Проверка пароля
	err = utils.ValidatePassword(user.Password)
	if err != nil {
		return err
	}

	// Проверка на занятость почты
	err = CheckEmailAvailability(user.Email)
	if err != nil {
		return err
	}

	return nil
}

// RegisterUser регистрирует пользователя. Проверяет корректность почты и пароля, отправляет на почту письмо с кодом подтверждения.
func RegisterUser(email, password, name string) (*model.Response, string, error) {
	user := model.User{
		Name:     name,
		Email:    email,
		Password: password,
		Role:     "user",
	}

	err := Validate(&user)
	if err != nil {
		return nil, "", err
	}

	code := utils.GenerateCode()

	err = smtp.App.SendConfirmationCodeEmail(user.Email, code, smtp.RegistrationCode)
	if err != nil {
		log.App.Error(" failed to send registration code: ", err)
		return nil, "", err
	}

	token, err := utils.GenerateToken(32)
	if err != nil {
		return nil, "", err
	}

	cache.Auth.Set(token, model.CachedUser{
		Email:      user.Email,
		Code:       code,
		Password:   user.Password,
		ActionType: model.RegistrationStarted,
		Name:       user.Name,
	})

	return &model.Response{
		Status:  true,
		Message: "Регистрация начата. На почту отправлен код подтверждения.",
	}, token, nil
}

// ValidateEmail проверяет доступность email для регистрации.
func ValidateEmail(email string) error {
	// Проверка электронной почты
	err := utils.ValidateEmail(email)
	if err != nil {
		return err
	}

	// Проверка на занятость почты
	err = CheckEmailAvailability(email)
	if err != nil {
		return err
	}

	return nil
}

// ConfirmRegistration подтверждает регистрацию пользователя.
func ConfirmRegistration(jwtToken, code string) (*model.Response, string, error) {
	user, ok := cache.Auth.Get(jwtToken)
	if !ok {
		return nil, "", fmt.Errorf("Данный аккаунт не требует подтверждения")
	}

	if user.Code != code {
		return nil, "", fmt.Errorf("Неверный код подтверждения")
	}

	if user.ActionType != model.RegistrationStarted {
		return nil, "", fmt.Errorf("ошибка при подтверждении регистрации")
	}

	newUser := &model.User{
		Email:    user.Email,
		Password: user.Password,
		Name:     user.Name,
		Role:     "user",
	}

	err := Validate(newUser)
	if err != nil {
		return nil, "", err
	}
	newPassword := utils.HashPasswordSHA256(user.Password)

	newUser.Password = newPassword

	res := db.App.Create(newUser)
	if res.Error != nil {
		return nil, "", res.Error
	}

	token, err := CreateJWTToken(newUser)
	if err != nil {
		return nil, "", err
	}

	return &model.Response{
		Status:  true,
		Message: "Регистрация завершена",
	}, token, nil
}

// Login выполняет авторизацию пользователя. Возвращает токен и ошибку в случае неудачи.
func Login(email, password string) (*model.Response, string, error) {
	// Проверка, существует ли пользователь с данным email
	var account model.User
	err := db.App.Where("email = ?", email).First(&account).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", fmt.Errorf("Пользователь с такой почтой не найден")
		}
		return nil, "", err
	}
	newPassword := utils.HashPasswordSHA256(password)
	if newPassword != account.Password {
		return nil, "", fmt.Errorf("Неверный пароль")
	}

	token, err := CreateJWTToken(&account)
	if err != nil {
		return nil, "", err
	}

	return &model.Response{
		Status:  true,
		Message: "Авторизация прошла успешно",
	}, token, nil
}

func JwtLogin(tokenString string) (*model.LoginResponse, error) {
	// Извлечение токена из заголовка
	token, err := ParseJWTToken(tokenString)
	if err != nil {
		return nil, err
	}

	var user model.User
	err = db.App.First(&user, token.UserId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Пользователь не найден")
		}
		return nil, err
	}

	if user.Role != token.Role {
		return nil, fmt.Errorf("Несоответствие роли пользователя")
	}

	return &model.LoginResponse{
		Response: model.Response{
			Status:  true,
			Message: "Вход выполнен",
		},
		Role: user.Role,
		Name: user.Name,
		ID:   user.ID,
	}, nil
}

func ResetPassword(email string) (string, error) {
	err := utils.ValidateEmail(email)
	if err != nil {
		return "", err
	}

	err = CheckEmailAvailability(email)
	if err == nil {
		return "", fmt.Errorf("Аккаунта с такой почтой не существует")
	}

	code := utils.GenerateCode()

	err = smtp.App.SendConfirmationCodeEmail(email, code, smtp.PasswordResetCode)
	if err != nil {
		return "", err
	}

	token, err := utils.GenerateToken(32)
	if err != nil {
		return "", err
	}

	cache.Auth.Set(token, model.CachedUser{
		Email:      email,
		Code:       code,
		ActionType: model.PasswordChangeStarted,
	})

	return token, nil
}

func ConfirmResetPassword(jwtToken, code string) (string, error) {
	user, ok := cache.Auth.Get(jwtToken)
	if !ok {
		return "", fmt.Errorf("Данный аккаунт не требует подтверждения")
	}

	if user.Code != code {
		return "", fmt.Errorf("Неверный код подтверждения")
	}

	if user.ActionType != model.PasswordChangeStarted {
		return "", fmt.Errorf("Ошибка при подтверждении регистрации")
	}

	newUser := &model.CachedUser{
		Email:      user.Email,
		ActionType: model.PasswordChangeComplete,
	}

	cache.Auth.Delete(jwtToken)

	newToken, err := utils.GenerateToken(32)
	if err != nil {
		return "", err
	}

	cache.Auth.Set(newToken, *newUser)

	return newToken, nil
}

func SetNewPassword(jwtToken, password string) (string, error) {
	log.App.Info("Attempting to set new password for token: ", jwtToken)

	user, ok := cache.Auth.Get(jwtToken)
	if !ok {
		log.App.Error("Account does not require confirmation for token: ", jwtToken)
		return "", fmt.Errorf("Данный аккаунт не требует подтверждения")
	}

	if user.ActionType != model.PasswordChangeComplete {
		log.App.Error("Error during new password setup for token: ", jwtToken)
		return "", fmt.Errorf("ошибка при установке нового пароля")
	}

	err := utils.ValidatePassword(password)
	if err != nil {
		log.App.Error("Password validation failed: ", err)
		return "", err
	}

	newPassword := utils.HashPasswordSHA256(password)

	res := db.App.Model(&model.User{}).Where("email = ?", user.Email).Updates(model.User{Password: newPassword})
	if res.Error != nil {
		log.App.Error("Error updating password in database: ", res.Error)
		return "", res.Error
	}

	newUser := &model.User{}
	err = db.App.Where("email = ?", user.Email).First(newUser).Error
	if err != nil {
		log.App.Error("Error retrieving user after password update: ", err)
		return "", err
	}

	token, err := CreateJWTToken(newUser)
	if err != nil {
		log.App.Error("Error creating JWT token for user: ", err)
		return "", err
	}

	log.App.Info("New password set successfully for user: ", user.Email)
	return token, nil
}

func NewPost(jwtToken string, req model.NewPostRequest) (*model.NewPostResponse, error) {
	// Извлечение токена из заголовка
	token, err := ParseJWTToken(jwtToken)
	if err != nil {
		return nil, err
	}

	var user model.User
	err = db.App.First(&user, token.UserId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Пользователь не найден")
		}
		return nil, err
	}

	var tags []model.Tag
	for _, tag := range req.Tags {
		tags = append(tags, model.Tag{
			Name: tag,
		})
	}

	post := model.Post{
		Title:    req.Title,
		SubTitle: req.SubTitle,
		Content:  req.Content,
		AuthorID: token.UserId,
		Tags:     tags,
	}

	res := db.App.Create(&post)
	if res.Error != nil {
		return nil, res.Error
	}

	return &model.NewPostResponse{
		Response: model.Response{
			Status:  true,
			Message: "Пост создан",
		},
		ID: post.ID,
	}, nil
}

func GetPost(jwtToken string, req model.GetPostRequest) (*model.GetPostResponse, error) {
	log.App.Info("Попытка извлечения токена из заголовка.")
	token, err := ParseJWTToken(jwtToken)
	if err != nil {
		log.App.Error("Ошибка при парсинге токена: " + err.Error())
		return nil, err
	}
	log.App.Info("Токен успешно распарсен: ", token.UserId)

	var user model.User
	err = db.App.First(&user, token.UserId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.App.Info("Пользователь не найден: " + fmt.Sprint(token.UserId))
			return nil, fmt.Errorf("Пользователь не найден")
		}
		log.App.Error("Ошибка при получении пользователя: " + err.Error())
		return nil, err
	}
	log.App.Info("Пользователь успешно получен: " + fmt.Sprintf("%+v", user))

	var postDB model.Post
	err = db.App.Preload("Tags").First(&postDB, req.ID).Error
	if err != nil {
		log.App.Error("Ошибка при получении поста с ID: " + fmt.Sprint(req.ID) + " Ошибка: " + err.Error())
		return nil, err
	}
	log.App.Info("Пост успешно получен из базы данных: " + fmt.Sprintf("%+v", postDB))

	// Проверяем права на редактирование
	canEdit := false
	if postDB.AuthorID == token.UserId {
		canEdit = true
		log.App.Info("Пользователь является автором поста, редактирование разрешено.")
	} else if token.Role == model.AdminRole {
		canEdit = true
		log.App.Info("Пользователь является администратором, редактирование разрешено.")
	}

	var tags []string
	for _, tag := range postDB.Tags {
		tags = append(tags, tag.Name)
	}

	post := model.PostJson{
		ID:       postDB.ID,
		Title:    postDB.Title,
		SubTitle: postDB.SubTitle,
		Content:  postDB.Content,
		Tags:     tags,
	}

	log.App.Info("Пост успешно сформирован для ответа: " + fmt.Sprintf("%+v", post))

	return &model.GetPostResponse{
		CanEdit: canEdit,
		Status:  true,
		Message: "Пост получен",
		Post:    post,
	}, nil
}

func DeletePost(jwtToken string, req model.DeletePostRequest) (*model.DeletePostResponse, error) {
	// Извлечение токена из заголовка
	token, err := ParseJWTToken(jwtToken)
	if err != nil {
		return nil, err
	}

	var user model.User
	err = db.App.First(&user, token.UserId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Пользователь не найден")
		}
		return nil, err
	}

	var postDB model.Post
	err = db.App.First(&postDB, req.ID).Error
	if err != nil {
		return nil, err
	}

	// Проверка прав на изменение поста
	if postDB.AuthorID != token.UserId {
		if token.Role != model.AdminRole {
			return nil, fmt.Errorf("У вас нет доступа к этому посту")
		}
	}
	db.App.Delete(&postDB)

	return &model.DeletePostResponse{
		Response: model.Response{
			Status:  true,
			Message: "Пост удален",
		},
	}, nil
}

func UpdatePost(jwtToken string, req model.UpdatePostRequest) (*model.UpdatePostResponse, error) {
	// Извлечение токена из заголовка
	token, err := ParseJWTToken(jwtToken)
	if err != nil {
		return nil, err
	}
	log.App.Info("Обновление поста: ", req)
	// Проверка существования пользователя
	var user model.User
	err = db.App.First(&user, token.UserId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Пользователь не найден")
		}
		return nil, err
	}

	// Проверка существования поста
	var postDB model.Post
	err = db.App.Preload("Tags").First(&postDB, req.Post.ID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("Пост не найден")
		}
		return nil, err
	}

	// Проверка прав на изменение поста
	if postDB.AuthorID != token.UserId {
		if token.Role != model.AdminRole {
			return nil, fmt.Errorf("У вас нет доступа к этому посту")
		}
	}

	// Обновление полей поста
	postDB.Title = req.Post.Title
	postDB.SubTitle = req.Post.SubTitle
	postDB.Content = req.Post.Content

	// Обработка тегов
	var newTags []model.Tag
	for _, tagName := range req.Post.Tags {
		var tag model.Tag

		// Проверяем, существует ли тег в базе данных
		err := db.App.Where("name = ?", tagName).First(&tag).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Если тег не существует, создаём его
			tag = model.Tag{Name: tagName}
			if err := db.App.Create(&tag).Error; err != nil {
				return nil, fmt.Errorf("Ошибка при создании тега: %v", err)
			}
		} else if err != nil {
			return nil, fmt.Errorf("Ошибка при проверке существования тега: %v", err)
		}

		// Добавляем тег в список новых тегов
		newTags = append(newTags, tag)
	}

	// Удаляем старые связи
	if err := db.App.Model(&postDB).Association("Tags").Clear(); err != nil {
		return nil, fmt.Errorf("Ошибка при удалении старых тегов: %v", err)
	}

	// Привязываем новые теги
	if err := db.App.Model(&postDB).Association("Tags").Append(newTags); err != nil {
		return nil, fmt.Errorf("Ошибка при добавлении новых тегов: %v", err)
	}

	// Сохраняем обновленный пост
	if err := db.App.Save(&postDB).Error; err != nil {
		return nil, fmt.Errorf("Ошибка при сохранении поста: %v", err)
	}

	return &model.UpdatePostResponse{
		Response: model.Response{
			Status:  true,
			Message: "Пост обновлен",
		},
	}, nil
}

func GetAllPosts(req model.GetAllPostsRequest) (*model.GetAllPostsResponse, error) {
	log.App.Info("Попытка получения всех постов.")

	var posts []model.Post
	err := db.App.Preload("Tags").Find(&posts).Error
	if err != nil {
		log.App.Error("Ошибка при получении постов: " + err.Error())
		return nil, err
	}
	log.App.Info("Посты успешно получены из базы данных.")

	var postResponses []model.PostForFeed
	for _, postDB := range posts {
		var tags []string
		for _, tag := range postDB.Tags {
			tags = append(tags, tag.Name)
		}

		// Устанавливаем значение InitialLiked
		initialLiked := false
		if req.ID != 0 {
			// Получаем лайки пользователя только если ID не равен 0
			var userLikes []model.Like
			err = db.App.Where("user_id = ?", req.ID).Find(&userLikes).Error
			if err != nil {
				log.App.Error("Ошибка при получении лайков пользователя: " + err.Error())
				return nil, err
			}

			// Создаем мапу для быстрого поиска лайков
			likedPosts := make(map[uint]bool)
			for _, like := range userLikes {
				likedPosts[like.PostID] = true
			}

			// Проверяем, лайкнул ли пользователь пост
			initialLiked = likedPosts[postDB.ID]
		}

		var user model.User
		err = db.App.First(&user, postDB.AuthorID).Error
		if err != nil {
			log.App.Error("Ошибка при получении пользователя: " + err.Error())
			return nil, err
		}

		postResponse := model.PostForFeed{
			ID:           postDB.ID,
			Title:        postDB.Title,
			SubTitle:     postDB.SubTitle,
			Content:      postDB.Content,
			Tags:         tags,
			AuthorName:   user.Name,
			Likes:        postDB.LikesCount,
			AuthorId:     postDB.AuthorID,
			InitialLiked: initialLiked,
			Date:         postDB.CreatedAt.Format("02.01.2006"),
		}
		postResponses = append(postResponses, postResponse)
	}

	return &model.GetAllPostsResponse{
		Status:  true,
		Message: "Посты успешно получены",
		Posts:   postResponses,
	}, nil
}

func GetAllMyPosts(req model.GetAllPostsRequest) (*model.GetAllPostsResponse, error) {
	log.App.Info("Попытка получения постов для пользователя с ID: ", req.ID)

	var posts []model.Post
	// Изменяем запрос, чтобы получить только посты текущего пользователя
	err := db.App.Preload("Tags").Where("author_id = ?", req.ID).Find(&posts).Error
	if err != nil {
		log.App.Error("Ошибка при получении постов: " + err.Error())
		return nil, err
	}
	log.App.Info("Посты успешно получены из базы данных.")

	var postResponses []model.PostForFeed
	for _, postDB := range posts {
		var tags []string
		for _, tag := range postDB.Tags {
			tags = append(tags, tag.Name)
		}

		// Устанавливаем значение InitialLiked
		initialLiked := false
		if req.ID != 0 {
			// Получаем лайки пользователя только если ID не равен 0
			var userLikes []model.Like
			err = db.App.Where("user_id = ?", req.ID).Find(&userLikes).Error
			if err != nil {
				log.App.Error("Ошибка при получении лайков пользователя: " + err.Error())
				return nil, err
			}

			// Создаем мапу для быстрого поиска лайков
			likedPosts := make(map[uint]bool)
			for _, like := range userLikes {
				likedPosts[like.PostID] = true
			}

			// Проверяем, лайкнул ли пользователь пост
			initialLiked = likedPosts[postDB.ID]
		}

		var user model.User
		err = db.App.First(&user, postDB.AuthorID).Error
		if err != nil {
			log.App.Error("Ошибка при получении пользователя: " + err.Error())
			return nil, err
		}

		postResponse := model.PostForFeed{
			ID:           postDB.ID,
			Title:        postDB.Title,
			SubTitle:     postDB.SubTitle,
			Content:      postDB.Content,
			Tags:         tags,
			Likes:        postDB.LikesCount,
			AuthorId:     postDB.AuthorID,
			InitialLiked: initialLiked,
			AuthorName:   user.Name,
			Date:         postDB.CreatedAt.Format("02.01.2006"),
		}
		postResponses = append(postResponses, postResponse)
	}

	return &model.GetAllPostsResponse{
		Status:  true,
		Message: "Посты успешно получены",
		Posts:   postResponses,
	}, nil
}

// PutLike обрабатывает запрос на постановку лайка
func PutLike(tokenString string, req model.LikeRequest) (*model.LikeResponse, error) {
	// Извлечение токена из заголовка
	token, err := ParseJWTToken(tokenString)
	if err != nil {
		return nil, err
	}
	// Логгируем данные запроса с информацией о пользователе и посте
	log.App.Info(fmt.Sprintf("Пользователь с ID %d ставит лайк на пост с ID %d", token.UserId, req.PostID))

	// Преобразуем PostID из string в uint
	postID, err := strconv.ParseUint(req.PostID, 10, 32)
	if err != nil {
		log.App.Error("Ошибка при преобразовании PostID: ", err)
		return nil, fmt.Errorf("недопустимый ID поста")
	}

	// Проверяем, существует ли уже лайк для данного пользователя и поста
	var existingLike model.Like
	err = db.App.Where("user_id = ? AND post_id = ?", token.UserId, uint(postID)).First(&existingLike).Error
	if err == nil {
		// Если лайк уже существует, возвращаем ошибку
		return nil, fmt.Errorf("Лайк уже поставлен для этого поста")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		// Если произошла другая ошибка
		log.App.Error("Ошибка при проверке существования лайка: ", err)
		return nil, err
	}

	// Создаем новый лайк
	newLike := model.Like{
		UserID: token.UserId,
		PostID: uint(postID), // Используем преобразованный ID
	}

	if err := db.App.Create(&newLike).Error; err != nil {
		log.App.Error("Ошибка при создании лайка: ", err)
		return nil, err
	}

	log.App.Info("Лайк успешно поставлен для поста с ID: ", req.PostID)

	// Обновляем количество лайков в посте
	var post model.Post
	if err := db.App.First(&post, uint(postID)).Error; err != nil {
		log.App.Error("Ошибка при получении поста: ", err)
		return nil, err
	}

	post.LikesCount++
	if err := db.App.Save(&post).Error; err != nil {
		log.App.Error("Ошибка при обновлении количества лайков: ", err)
		return nil, err
	}

	return &model.LikeResponse{
		Response: model.Response{
			Status:  true,
			Message: "Лайк успешно поставлен",
		},
	}, nil
}

// DownLike обрабатывает запрос на снятие лайка
func DownLike(tokenString string, req model.LikeRequest) (*model.LikeResponse, error) {
	log.App.Info("Попытка снять лайк для поста с ID: ", req.PostID)
	// Извлечение токена из заголовка
	token, err := ParseJWTToken(tokenString)
	if err != nil {
		return nil, err
	}
	// Логгируем данные запроса с информацией о пользователе и посте
	log.App.Info(fmt.Sprintf("Пользователь с ID %d снимает лайк с поста с ID %d", token.UserId, req.PostID))
	// Преобразуем PostID из string в uint
	postID, err := strconv.ParseUint(req.PostID, 10, 32)
	if err != nil {
		log.App.Error("Ошибка при преобразовании PostID: ", err)
		return nil, fmt.Errorf("недопустимый ID поста")
	}

	// Проверяем, существует ли лайк для данного пользователя и поста
	var existingLike model.Like
	err = db.App.Where("user_id = ? AND post_id = ?", token.UserId, uint(postID)).First(&existingLike).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Если лайк не найден, возвращаем ошибку
			return nil, fmt.Errorf("Лайк не найден для этого поста")
		}
		log.App.Error("Ошибка при проверке существования лайка: ", err)
		return nil, err
	}

	// Удаляем лайк
	if err := db.App.Delete(&existingLike).Error; err != nil {
		log.App.Error("Ошибка при удалении лайка: ", err)
		return nil, err
	}

	log.App.Info("Лайк успешно снят для поста с ID: ", req.PostID)

	// Обновляем количество лайков в посте
	var post model.Post
	if err := db.App.First(&post, uint(postID)).Error; err != nil {
		log.App.Error("Ошибка при получении поста: ", err)
		return nil, err
	}

	post.LikesCount--
	if post.LikesCount < 0 {
		post.LikesCount = 0 // Убедимся, что количество лайков не становится отрицательным
	}

	if err := db.App.Save(&post).Error; err != nil {
		log.App.Error("Ошибка при обновлении количества лайков: ", err)
		return nil, err
	}

	return &model.LikeResponse{
		Response: model.Response{
			Status:  true,
			Message: "Лайк успешно снят",
		},
	}, nil
}

func SetPassword(tokenString string, req model.SetPasswordRequest) (*model.SetPasswordResponse, error) {
	// Извлечение токена из заголовка
	token, err := ParseJWTToken(tokenString)
	if err != nil {
		return nil, err
	}

	log.App.Info("Попытка установить пароль для пользователя с ID: ", token.UserId)
	// Проверка пароля
	err = utils.ValidatePassword(req.Password)
	if err != nil {
		return nil, err
	}
	newPassword := utils.HashPasswordSHA256(req.Password)

	db.App.Model(&model.User{}).Where("id = ?", token.UserId).Update("password", newPassword)

	return &model.SetPasswordResponse{
		Response: model.Response{
			Status:  true,
			Message: "Пароль успешно установлен",
		},
	}, nil
}
