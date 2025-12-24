package config

import (
	"fmt"
	"log"
	"os" //used to read environment variables (os.Getenv)

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global database connection instance
var DB *gorm.DB

// ConnectDatabase establishes connection to PostgreSQL using GORM
func ConnectDatabase() {

	dsn := fmt.Sprintf( //Creates a connection string (DSN = Data Source Name) using fmt.Sprintf.
		//This string tells GORM how to connect to PostgreSQL.

		// Build PostgreSQL connection string from environment variables
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",

		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_SSLMODE"),
	)

	// Set GORM logger level based on environment
	var gormLogger logger.Interface
	if os.Getenv("ENV") == "development" {
		gormLogger = logger.Default.LogMode(logger.Info)
	} else {
		gormLogger = logger.Default.LogMode(logger.Error)
	}

	// Open database connection with GORM
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("✅ Database connection established successfully")

}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}
