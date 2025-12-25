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
	"path/filepath"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
	}

	config.ConnectDatabase()
	migrations.RunMigrations()

	router := routers.SetupRoutes()

	// ✅ Serve frontend static files (production)
	frontendPath := "../frontend/dist"

	// API routes with middleware
	http.Handle("/api/", middlewares.CORSMiddleware(middlewares.LoggerMiddleware(router)))

	// Serve frontend files
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If file exists, serve it
		path := filepath.Join(frontendPath, r.URL.Path)

		if _, err := os.Stat(path); os.IsNotExist(err) {
			// If file doesn't exist, serve index.html (for client-side routing)
			http.ServeFile(w, r, filepath.Join(frontendPath, "index.html"))
			return
		}

		// Serve the file
		http.FileServer(http.Dir(frontendPath)).ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	addr := fmt.Sprintf("0.0.0.0:%s", port)

	log.Printf("🚀 Server starting on http://%s\n", addr)
	log.Printf("📚 Environment: %s\n", os.Getenv("ENV"))
	log.Printf("📁 Serving frontend from: %s\n", frontendPath)

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("❌ Server failed to start:", err)
	}
}
