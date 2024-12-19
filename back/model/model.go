package model

import (
	"gorm.io/gorm"
)

const (
	AdminRole = "admin"
	UserRole  = "user"
)

//nolint:unused
type User struct {
	gorm.Model `swagger:"ignore"`
	Name       string `gorm:"type:varchar(1000);not null"json:"Name"`
	Email      string `gorm:"type:varchar(1000);not null;unique"json:"email"`
	Password   string `gorm:"type:varchar(1000);not null"json:"password"`
	Role       string `gorm:"type:varchar(100);not null"json:"role"`
}

//nolint:unused
type Like struct {
	gorm.Model `swagger:"ignore"`
	UserID     uint `json:"user_id"`                       // ID пользователя, который поставил лайк
	PostID     uint `json:"post_id"`                       // ID поста, к которому относится лайк
	Post       Post `gorm:"foreignKey:PostID" json:"post"` // Связь с постом
}

//nolint:unused
type Tag struct {
	gorm.Model `swagger:"ignore"`
	Name       string `gorm:"type:varchar(100);not null;unique" json:"name"`
	Posts      []Post `gorm:"many2many:post_tags;" json:"posts"` // Связь многие-ко-многим с постами
}

//nolint:unused
type Post struct {
	gorm.Model `swagger:"-"`
	Title      string `gorm:"type:varchar(1000);not null" json:"title"`
	SubTitle   string `gorm:"type:varchar(1000);not null" json:"subtitle"`
	Content    string `gorm:"type:text;not null" json:"content"`
	Tags       []Tag  `gorm:"many2many:post_tags;" json:"tags"` // Связь многие-ко-многим с тегами
	AuthorID   uint   `json:"author_id"`
	Likes      []Like `gorm:"foreignKey:PostID" json:"likes"` // Связь с лайками
	LikesCount int    `json:"likes_count"`                    // Количество лайков
}

type ProfileRequest struct {
	ID int `json:"id"`
}

type ProfileResponse struct {
	Status  bool   `json:"status"`
	Message string `json:"message,omitempty"`
	Name    string `json:"name"`
}
