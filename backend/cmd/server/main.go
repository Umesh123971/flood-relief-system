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
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
	}

	// Connect to database
	config.ConnectDatabase()

	// Run migrations
	migrations.RunMigrations()

	// Setup routes
	router := routers.SetupRoutes()

	// ✅ REMOVED: Frontend serving code (lines 33-46 deleted)

	// Apply middleware to API routes only
	http.Handle("/api/", middlewares.CORSMiddleware(middlewares.LoggerMiddleware(router)))

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	addr := fmt.Sprintf("0.0.0.0:%s", port)

	log.Printf("🚀 Server starting on http://%s\n", addr)
	log.Printf("📚 Environment: %s\n", os.Getenv("ENV"))

	// Start server
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("❌ Server failed to start:", err)
	}
}
