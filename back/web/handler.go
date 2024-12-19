package web

import (
	"app/auth"
	"app/db"
	"app/log"
	"app/model"
	"app/utils"
	"encoding/json"
	"fmt"
	"net/http"
)

const secureCookie = false

// HandleRegistrationStarted обрабатывает начало регистрации
// @Summary Начало регистрации
// @Description Обрабатывает запрос на начало регистрации пользователя, проверяет корректность данных и отправляет код подтверждения на почту.
// @Tags registration
// @Accept json
// @Produce json
// @Param request body model.RegisterRequest true "Запрос на начало регистрации"
// @Success 200 {object} model.Response "Регистрация начата"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /registration/start [post]
func (app *WebApp) HandleRegistrationStarted(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest

	// Декодируем JSON из тела запроса в структуру
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(r.RemoteAddr, " failed to decode registration request: ", err)
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}
	log.App.Info("Received registration request for account: ", req)
	response, token, err := auth.RegisterUser(req.Email, req.Password, req.Name)
	if err != nil {
		log.App.Error(r.RemoteAddr, " failed to register student: ", err)
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	// Устанавливаем токен в httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "registrationToken",
		Value:    token,
		HttpOnly: true,
		Secure:   secureCookie,
		Path:     "/",
	})

	log.App.Info("Received registration request for email: ", req.Email)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleValidateEmail проверяет доступность email для регистрации
// @Summary Проверка доступности email для регистрации
// @Description Обрабатывает запрос на проверку доступности email для регистрации, возвращает статус д��ступности.
// @Tags registration
// @Accept json
// @Produce json
// @Param request body model.EmailRequest true "Запрос на проверку доступности email"
// @Success 200 {object} model.Response "Email доступен для регистрации"
// @Failure 400 {object} model.Response "Email недоступен для регистрации"
// @Router /registration/validate-email [post]
func (app *WebApp) HandleValidateEmail(w http.ResponseWriter, r *http.Request) {
	var req model.EmailRequest

	// Декодируем JSON из тела запроса в структуру
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	err = auth.ValidateEmail(req.Email)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.Response{Status: false, Message: "Email доступен для регистрации"})
}

// HandleRegistrationConfirmation обрабатывает подтверждение регистрации
// @Summary Подтверждение регистрации
// @Description Обрабатывает запрос на подтверждение регистрации пользователя с использованием кода подтверждения.
// @Tags registration
// @Accept json
// @Produce json
// @Param request body model.CodeRequest true "Запрос на подтверждение регистрации"
// @Success 200 {object} model.Response "Регистрация подтверждена"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /registration/confirm [post]
func (app *WebApp) HandleRegistrationConfirmation(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("registrationToken")
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен регистрации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.CodeRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	response, token, err := auth.ConfirmRegistration(token, req.Code)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	// Устанавливаем токен в httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "authToken",
		Value:    token,
		HttpOnly: true,
		Secure:   secureCookie,
		Path:     "/",
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleLogin обрабатывает вход пользователя
// @Summary Вход пользователя
// @Description Обрабатывает запрос на вход пользователя. При успешной аутентификации JWT токен будет отправлен в httpOnly cookie и автоматически использоваться в последующих запросах.
// @Tags login
// @Accept json
// @Produce json
// @Param request body model.EmailPasswordRequest true "Запрос на вход"
// @Success 200 {object} model.RoleResponse "Вход выполнен, токен охранен в cookie"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /auth/login [post]
func (app *WebApp) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req model.EmailPasswordRequest

	// Декодируем JSON из тела запроса в структуру
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(r.RemoteAddr, " failed to decode login request: ", err)
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	response, token, err := auth.Login(req.Email, req.Password)
	if err != nil {
		log.App.Error(r.RemoteAddr, " failed to login: ", err)
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	// Устанавливаем токен в httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "authToken",
		Value:    token,
		HttpOnly: true,
		Secure:   secureCookie,
		Path:     "/",
	})

	log.App.Info("User logged in successfully: ", req.Email)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleJwtLogin обрабатывает вход пользователя по JWT токену
// @Summary Вход по JWT токену
// @Description Проверяет валидность JWT токена и выполняет вход пользователя.
// @Tags login
// @Accept json
// @Produce json
// @Security Bearer
// @Param Authorization header string true "JWT токен в формате: Bearer <token>"
// @Success 200 {object} model.RoleResponse "Вход выполнен успешно"
// @Failure 401 {object} model.Response "Недействительный токен"
// @Router /auth/jwt [post]
func (app *WebApp) HandleJwtLogin(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authToken")
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	response, err := auth.JwtLogin(token)
	if err != nil {
		log.App.Info(r.RemoteAddr, " is not auth")
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Invalid token"}), http.StatusUnauthorized)
		return
	}

	log.App.Info(r.RemoteAddr, " is auth")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleLogout обрабатывает выход пользователя
// @Summary Выход пользователя
// @Description Удаляет токен авторизации из cookie и завершает сессию пользователя.
// @Tags auth
// @Accept json
// @Produce json
// @Success 200 {object} model.Response "Выход выполнен успешно"
// @Failure 400 {object} model.Response "Ошибка при выходе"
// @Router /auth/logout [post]
func (app *WebApp) HandleLogout(w http.ResponseWriter, r *http.Request) {
	// Устанавливаем токен в httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "authToken",
		Value:    "",
		HttpOnly: true,
		Secure:   secureCookie,
		Path:     "/",
		MaxAge:   -1,
	})

	// Отправляем успешный ответ
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.Response{Status: true, Message: "Выход выполнен успешно"})
}

// HandleResetPasswordStarted обрабатывает начало сброса пароля
// @Summary Начало сброса пароля
// @Description Обрабатывает запрос на начало сброса пароля, отправляет код подтверждения на почту.
// @Tags password
// @Accept json
// @Produce json
// @Param request body model.EmailPasswordRequest true "Запрос на начало сброса пароля"
// @Success 200 {object} model.Response "Сброс пароля начат"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /password/reset/start [post]
func (app *WebApp) HandleResetPasswordStarted(w http.ResponseWriter, r *http.Request) {
	var req model.EmailPasswordRequest

	// Декодируем JSON из тела запроса в структуру
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	token, err := auth.ResetPassword(req.Email)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	// Устанавливаем токен в httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "resetPasswordToken",
		Value:    token,
		HttpOnly: true,
		Secure:   secureCookie,
		Path:     "/",
	})

	log.App.Info("Received reset password request for email: ", req.Email)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.Response{Status: false, Message: "Сброс пароля начат. На почту отправлен код подтверждения."})
}

// HandleResetPasswordConfirmation обрабатывает подтверждение сброса пароля
// @Summary Подтверждение сброса пароля
// @Description Обрабатывает запрос на подтверждение сброса пароля с использованием кода подтверждения.
// @Tags password
// @Accept json
// @Produce json
// @Param request body model.CodeRequest true "Запрос на подтверждение сброса пароля"
// @Success 200 {object} model.Response "Сброс пароля подтвержден"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /password/reset/confirm [post]
func (app *WebApp) HandleResetPasswordConfirmation(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("resetPasswordToken")
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен восстановления пароля"}), http.StatusBadRequest)
		log.App.Error("Reset password confirmation failed: missing reset password token")
		return
	}
	token := cookie.Value

	var req model.CodeRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		log.App.Error("Failed to decode reset password confirmation request: ", err)
		return
	}

	log.App.Info("Attempting to confirm reset password for token: ", token)

	token, err = auth.ConfirmResetPassword(token, req.Code)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		log.App.Error("Reset password confirmation failed: ", err)
		return
	}

	// Устанавливаем токен в httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "newPasswordToken",
		Value:    token,
		HttpOnly: true,
		Secure:   secureCookie,
		Path:     "/",
	})

	log.App.Info("Reset password confirmed successfully for token: ", token)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.Response{Status: false, Message: "Сброс пароля подтвержден. Введите новый пароль."})
}

// HandleSetNewPassword обрабатывает установку нового пароля
// @Summary Установка нового пароля
// @Description Обрабатывает запрос на установку нового пароля.
// @Tags password
// @Accept json
// @Produce json
// @Param request body model.PasswordRequest true "Запрос на установку нового пароля"
// @Success 200 {object} model.Response "Новый пароль установлен"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /password/new [post]
func (app *WebApp) HandleSetNewPassword(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("newPasswordToken")
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен восстановления пароля"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.PasswordRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	token, err = auth.SetNewPassword(token, req.Password)
	if err != nil {
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	// Устанавливаем токен в httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "authToken",
		Value:    token,
		HttpOnly: true,
		Secure:   secureCookie,
		Path:     "/",
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(model.Response{Status: false, Message: "Новый пароль установлен"})
}

// HandleNewPost обрабатывает создание нового поста
// @Summary Создание нового поста
// @Description Обрабатывает запрос на создание нового поста, требует авторизации.
// @Tags posts
// @Accept json
// @Produce json
// @Param request body model.NewPostRequest true "Запрос на создание нового поста"
// @Success 200 {object} model.NewPostResponse "Пост успешно создан"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/new-post [post]
func (app *WebApp) HandleNewPost(w http.ResponseWriter, r *http.Request) {
	log.App.Info("Начинаем обработку запроса на создание нового поста.") // Логгируем начало обработки

	cookie, err := r.Cookie("authToken")
	if err != nil {
		log.App.Error("Ошибка: отсутствует токен авторизации.") // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.NewPostRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	log.App.Info(fmt.Sprintf("Получен запрос на создание поста: %+v", req)) // Логгируем данные запроса

	response, err := auth.NewPost(token, req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при создании поста: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	log.App.Info(fmt.Sprintf("Пост успешно создан с ID: %d", response.ID)) // Логгируем успешное создание поста

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleGetPost обрабатывает запрос на получение поста
// @Summary Получение поста
// @Description Обрабатывает запрос на получение поста по ID.
// @Tags posts
// @Accept json
// @Produce json
// @Param request body model.GetPostRequest true "Запрос на получение поста"
// @Success 200 {object} model.Post "Пост успешно получен"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/get-post [post]
func (app *WebApp) HandleGetPost(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authToken")
	if err != nil {
		log.App.Error("Ошибка: отсутствует токен авторизации.") // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.GetPostRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	log.App.Info(fmt.Sprintf("Получен запрос на создание поста: %+v", req)) // Логгируем данные запроса

	response, err := auth.GetPost(token, req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при создании поста: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleDeletePost обрабатывает удаление поста
// @Summary Удаление поста
// @Description Обрабатывает запрос на удаление поста по ID.
// @Tags posts
// @Accept json
// @Produce json
// @Param request body model.DeletePostRequest true "Запрос на удаление поста"
// @Success 200 {object} model.Response "Пост успешно удален"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/delete-post [post]
func (app *WebApp) HandleDeletePost(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authToken")
	if err != nil {
		log.App.Error("Ошибка: отсутствует токен авторизации.") // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.DeletePostRequest
	// Читаем сырые данные из тела запроса
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	response, err := auth.DeletePost(token, req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при удалении поста: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleUpdatePost обрабатывает обновление поста
// @Summary Обновление поста
// @Description Обрабатывает запрос на обновление поста по ID.
// @Tags posts
// @Accept json
// @Produce json
// @Param request body model.UpdatePostRequest true "Запрос на обновление поста"
// @Success 200 {object} model.Response "Пост успешно обновлен"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/update-post [post]
func (app *WebApp) HandleUpdatePost(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authToken")
	if err != nil {
		log.App.Error("Ошибка: отсутствует токен авторизации.") // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.UpdatePostRequest
	// Читаем сырые данные из тела запроса
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	response, err := auth.UpdatePost(token, req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при обновлении поста: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleGetAllPosts обрабатывает запрос на получение всех постов
// @Summary Получение всех постов
// @Description Обрабатывает запрос на получение всех постов.
// @Tags posts
// @Accept json
// @Produce json
// @Param request body model.GetAllPostsRequest true "Запрос на получение всех постов"
// @Success 200 {object} model.GetAllPostsResponse "Посты успешно получены"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/get-all-posts [post]
func (app *WebApp) HandleGetAllPosts(w http.ResponseWriter, r *http.Request) {
	var req model.GetAllPostsRequest

	// Декодируем JSON из тела запроса в структуру
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	log.App.Info(fmt.Sprintf("Получен запрос на создание поста: %+v", req)) // Логгируем данные запроса

	response, err := auth.GetAllPosts(req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при создании поста: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleGetAllMyPosts обрабатывает запрос на получение постов текущего пользователя
// @Summary Получение постов текущего пользователя
// @Description Обрабатывает запрос на получение всех постов текущего пользователя.
// @Tags posts
// @Accept json
// @Produce json
// @Param request body model.GetAllPostsRequest true "Запрос на получение постов текущего пользователя"
// @Success 200 {object} model.GetAllPostsResponse "Посты успешно получены"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/get-all-my-posts [post]
func (app *WebApp) HandleGetAllMyPosts(w http.ResponseWriter, r *http.Request) {
	var req model.GetAllPostsRequest

	// Декодируем JSON из тела запроса в структуру
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	log.App.Info(fmt.Sprintf("Получен запрос на создание поста: %+v", req)) // Логгируем данные запроса

	response, err := auth.GetAllMyPosts(req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при создании поста: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandlePutLike обрабатывает запрос на постановку лайка
// @Summary Постановка лайка
// @Description Обрабатывает запрос на постановку лайка к посту.
// @Tags likes
// @Accept json
// @Produce json
// @Param request body model.LikeRequest true "Запрос на постановку лайка"
// @Success 200 {object} model.LikeResponse "Лайк успешно поставлен"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/put-like [post]
func (app *WebApp) HandlePutLike(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authToken")
	if err != nil {
		log.App.Error("Ошибка: отсутствует токен авторизации.") // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.LikeRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	response, err := auth.PutLike(token, req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при постановке лайка: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleDownLike обрабатывает запрос на снятие лайка
// @Summary Снятие лайка
// @Description Обрабатывает запрос на снятие лайка с поста.
// @Tags likes
// @Accept json
// @Produce json
// @Param request body model.LikeRequest true "Запрос на снятие лайка"
// @Success 200 {object} model.LikeResponse "Лайк успешно снят"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/down-like [post]
func (app *WebApp) HandleDownLike(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authToken")
	if err != nil {
		log.App.Error("Ошибка: отсутствует токен авторизации.") // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.LikeRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при распарсивании запроса: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	response, err := auth.DownLike(token, req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при снятии лайка: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleGetUserProfile обрабатывает запрос на получение профиля пользователя по ID
// @Summary Получение профиля пользователя
// @Description Обрабатывает запрос на получение профиля пользователя по ID.
// @Tags user
// @Accept json
// @Produce json
// @Param request body model.ProfileRequest true "Запрос на получение профиля пользователя"
// @Success 200 {object} model.ProfileResponse "Профиль пользователя получен"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/get-user-profile [post]
func (app *WebApp) HandleGetUserProfile(w http.ResponseWriter, r *http.Request) {
	var req model.ProfileRequest

	// Декодируем JSON из тела запроса в структуру
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(r.RemoteAddr, " failed to decode get user profile request: ", err)
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	// Логика для получения профиля пользователя по ID
	var user model.User
	res := db.App.DB.First(&user, req.ID) // Предполагается, что у вас есть метод для получения пользователя
	if res.Error != nil {
		log.App.Error(r.RemoteAddr, " failed to get user profile: ", res.Error)
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: res.Error.Error()}), http.StatusBadRequest)
		return
	}

	response := model.ProfileResponse{
		Status: true,
		Name:   user.Name,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleSetPassword обрабатывает запрос на установку пароля
// @Summary Установка пароля
// @Description Обрабатывает запрос на установку пароля.
// @Tags user
// @Accept json
// @Produce json
// @Param request body model.SetPasswordRequest true "Запрос на установку пароля"
// @Success 200 {object} model.SetPasswordResponse "Пароль успешно установлен"
// @Failure 400 {object} model.Response "Ошибка в запросе"
// @Router /api/set-password [post]
func (app *WebApp) HandleSetPassword(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authToken")
	if err != nil {
		log.App.Error("Ошибка: отсутствует токен авторизации.") // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Отсутствует токен авторизации"}), http.StatusBadRequest)
		return
	}
	token := cookie.Value

	var req model.SetPasswordRequest

	// Декодируем JSON из тела запроса в структуру
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.App.Error(r.RemoteAddr, " failed to decode set password request: ", err)
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: "Не удалось распарсить запрос: " + err.Error()}), http.StatusBadRequest)
		return
	}

	response, err := auth.SetPassword(token, req)
	if err != nil {
		log.App.Error(fmt.Sprintf("Ошибка при установке пароля: %v", err)) // Логгируем ошибку
		http.Error(w, utils.StructToJSONString(model.Response{Status: false, Message: err.Error()}), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
