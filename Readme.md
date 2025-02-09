# Проект Scribble

Scribble — это веб-приложение, разработанное с использованием React и Go, которое предоставляет API для управления данными и взаимодействия через HTTP-эндпоинты. Это приложение включает в себя функциональность для регистрации пользователей, аутентификации, управления постами и лайками.

## Установка и запуск

### Шаг 1: Установка необходимых инструментов

1. **Go**

   - Скачайте и установите Go с [официального сайта](https://golang.org/dl/).
   - Проверьте установку:
     ```bash
     go version
     ```

2. **Node.js**

   - Скачайте и установите Node.js с [официального сайта](https://nodejs.org/).
   - Проверьте установку:
     ```bash
     node -v
     npm -v
     ```

3. **PostgreSQL**
   - Скачайте и установите PostgreSQL с [официального сайта](https://www.postgresql.org/download/).
   - Создайте базу данных с именем `scribble` и пользователя `scribble_user` с паролем `123456`.

### Шаг 2: Настройка окружения для бэкенда
Инструкция по настройке smtp: https://yandex.ru/support/yandex-360/customers/mail/ru/mail-clients/others
1. **Настройте файл `.env` в папке `back`:**

   - Откройте файл `back/.env` и заполните его следующими значениями:

     ```env
     # WEB APP CONFIG
     APP_IP=localhost
     APP_PORT=8080
     APP_URL=http://localhost:8080
     APP_JWT_SECRET=ваш_секретный_ключ

     # DATABASE CONFIG
     DBHOST=localhost
     DBPORT=5432
     DBNAME=scribble
     DBUSER=scribble_user
     DBPASS=123456
     DBSSLMODE=disable

     # SMTP
     SMTP_SERVER=smtp.yandex.ru
     SMTP_MAIL_NAME=ваш_email@yandex.ru
     SMTP_SSL_PORT=465
     SMTP_PASSWORD=ваш_пароль
     SMTP_PAUSE=1000

     # AUTH CACHE
     AUTH_TIME_TO_LIVE=15
     AUTH_CLEANUP_INTERVAL=30
     ```

### Шаг 3: Запуск бэкенда

1. **Запустите батник для сборки и запуска бэкенда:**
   - Откройте терминал и перейдите в папку `back`:
     ```bash
     cd путь_к_вашему_проекту/back
     ```
   - Запустите батник:
     ```bash
     initSwag.bat
     ```
   - После этого выполните:
     ```bash
     go build main.go
     ```
   - Запустите скомпилированный файл:
     ```bash
     main.exe
     ```

### Шаг 4: Настройка окружения для фронтенда

1. **Настройте файл `.env` в папке `front`:**
   - Откройте файл `front/.env` и добавьте или измените следующие строки:
     ```env
     VITE_API_KEY=ваш_api_ключ
     ```

### Шаг 5: Установка зависимостей и запуск фронтенда

1. **Установите зависимости:**

   - Откройте терминал и перейдите в папку `front`:
     ```bash
     cd путь_к_вашему_проекту/front
     ```
   - Установите зависимости с помощью npm:
     ```bash
     npm install
     ```

2. **Запустите фронтенд:**
   - После установки зависимостей запустите проект:
     ```bash
     npm run dev
     ```

### Шаг 6: Доступ к Swagger UI

- Откройте браузер и перейдите по адресу:
  ```http
  http://localhost:8080/swagger/index.html
  ```

## Технологический стек

### Языки программирования

- **Go** — для бэкенда
- **JavaScript/TypeScript** — для фронтенда

### Фреймворки и библиотеки

- **Бэкенд:**

  - **GORM** — ORM для работы с базой данных
  - **Gorilla Mux** — маршрутизатор для HTTP-запросов
  - **Gorilla WebSocket** — для работы с WebSocket
  - **JWT-Go** — для работы с JSON Web Tokens
  - **Swaggo** — для генерации документации Swagger

- **Фронтенд:**
  - **React** — библиотека для построения пользовательских интерфейсов
  - **React Router** — для маршрутизации в приложении
  - **Axios** — для выполнения HTTP-запросов
  - **Tailwind CSS** — для стилизации компонентов
  - **Vite** — сборщик для разработки и сборки приложений

### Базы данных

- **PostgreSQL** — реляционная база данных для хранения данных приложения

### Инструменты

- **Node.js** — для разработки фронтенда
- **npm** — для управления зависимостями фронтенда
- **ESLint** — для статического анализа кода и обеспечения качества кода

### Заключение

Теперь вы готовы запустить проект Scribble на своем локальном компьютере. Если у вас возникнут дополнительные вопросы или проблемы, не стесняйтесь спрашивать!
