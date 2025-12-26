package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"flood-relief-system/backend/config"
	middlewares "flood-relief-system/backend/middleware"
	"flood-relief-system/backend/migrations"
	routers "flood-relief-system/backend/routers"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	config.ConnectDatabase()
	migrations.RunMigrations()

	// ------------------------
	// API ROUTER
	// ------------------------
	apiRouter := routers.SetupRoutes()

	// ------------------------
	// MAIN ROUTER
	// ------------------------
	mainRouter := http.NewServeMux()

	// 1️⃣ API routes
	mainRouter.Handle("/api/", apiRouter)

	// 2️⃣ Serve React static files
	frontendPath := "./frontend/dist"
	mainRouter.Handle("/", spaHandler(frontendPath))

	// ------------------------
	// Middlewares
	// ------------------------
	handler := middlewares.LoggerMiddleware(mainRouter)
	handler = middlewares.CORSMiddleware(handler)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	addr := ":" + port
	log.Println("🚀 Server running at http://localhost" + addr)

	log.Fatal(http.ListenAndServe(addr, handler))
}

func spaHandler(staticPath string) http.Handler {
	indexPath := filepath.Join(staticPath, "index.html")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// If API request → skip
		if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
			http.NotFound(w, r)
			return
		}

		// Try to serve static file
		path := filepath.Join(staticPath, r.URL.Path)

		if _, err := os.Stat(path); err == nil {
			http.ServeFile(w, r, path)
			return
		}

		// Fallback → index.html
		http.ServeFile(w, r, indexPath)
	})
}
