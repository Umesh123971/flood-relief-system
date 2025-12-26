package main

import (
	"flood-relief-system/backend/config"
	middlewares "flood-relief-system/backend/middleware"
	"flood-relief-system/backend/migrations"
	routers "flood-relief-system/backend/routers"

	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
	}

	// DEBUG — check if .env loaded
	fmt.Println("DEBUG PORT =", os.Getenv("SERVER_PORT"))

	config.ConnectDatabase()
	migrations.RunMigrations()

	router := routers.SetupRoutes()

	handler := middlewares.LoggerMiddleware(router)
	handler = middlewares.CORSMiddleware(handler)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	host := os.Getenv("SERVER_HOST")
	if host == "" {
		host = "localhost"
	}

	addr := fmt.Sprintf("%s:%s", host, port)

	log.Printf("🚀 Server starting on http://%s\n", addr)
	log.Printf("📚 Environment: %s\n", os.Getenv("ENV"))

	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal("❌ Server failed to start:", err)
	}
}
