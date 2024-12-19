package web

import (
	"log"
	"net/http"

	httpSwagger "github.com/swaggo/http-swagger"
)

// NotFoundHandler - обработчик для несуществующих маршрутов.
func NotFoundHandler(w http.ResponseWriter, r *http.Request) {
	http.NotFound(w, r)
	log.Printf("404 Not Found: %s", r.URL.Path)
}

// SetRoutes устанавливает маршруты для HTTP-сервера.
// Эта функция связывает URL-пути с обработчиками.
func (app *WebApp) SetRoutes() {
	// Маршрут для WebSocket соединения

	app.Router.HandleFunc("/api/reg", app.HandleRegistrationStarted).Methods("POST")
	app.Router.HandleFunc("/api/code-confirm", app.HandleRegistrationConfirmation).Methods("POST")

	app.Router.HandleFunc("/api/login", app.HandleLogin).Methods("POST")
	app.Router.HandleFunc("/api/jwt-login", app.HandleJwtLogin).Methods("POST")

	app.Router.HandleFunc("/api/logout", app.HandleLogout).Methods("POST")

	app.Router.HandleFunc("/api/new-post", app.HandleNewPost).Methods("POST")

	app.Router.HandleFunc("/api/get-post", app.HandleGetPost).Methods("POST")
	app.Router.HandleFunc("/api/delete-post", app.HandleDeletePost).Methods("POST")
	app.Router.HandleFunc("/api/update-post", app.HandleUpdatePost).Methods("POST")

	app.Router.HandleFunc("/api/get-all-posts", app.HandleGetAllPosts).Methods("POST")
	app.Router.HandleFunc("/api/get-all-my-posts", app.HandleGetAllMyPosts).Methods("POST")

	app.Router.HandleFunc("/api/put-like", app.HandlePutLike).Methods("POST")
	app.Router.HandleFunc("/api/down-like", app.HandleDownLike).Methods("POST")

	app.Router.HandleFunc("/api/get-user-profile", app.HandleGetUserProfile).Methods("POST")

	app.Router.HandleFunc("/api/set-password", app.HandleSetPassword).Methods("POST")

	// Добавляем маршрут для Swagger
	app.Router.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	// Обработчик для несуществующих маршрутов
	app.Router.NotFoundHandler = http.HandlerFunc(NotFoundHandler)
}
