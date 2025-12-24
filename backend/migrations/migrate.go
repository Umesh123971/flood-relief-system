package migrations

import (
	"flood-relief-system/backend/config"
	"flood-relief-system/backend/models"
	"log"
)

// RunMigrations auto-migrates all database models
func RunMigrations() {
	db := config.GetDB()

	log.Println("🔄 Running database migrations...")

	db.AutoMigrate(&models.HelpRequest{})
	db.AutoMigrate(&models.Volunteer{})
	db.AutoMigrate(&models.ReliefSupply{})
	db.AutoMigrate(&models.RescueOperation{})
	db.AutoMigrate(&models.EmergencyContact{})

	log.Println("✅ Migrations completed successfully")
}
