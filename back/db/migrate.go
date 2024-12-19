package db

import (
	"app/log"
	"app/model"
)

// Migrate выполняет миграции базы данных
func (db *DataBase) Migrate() error {

	err := db.AutoMigrate(
		&model.User{},
		&model.Post{},
		&model.Tag{},
		&model.Like{},
	)
	if err != nil {
		log.App.Error("Auto-migration failed:", err)
		return err
	}

	return nil
}
