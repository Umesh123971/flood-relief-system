package controllers

import (
	"encoding/json"
	"flood-relief-system/backend/config"
	"flood-relief-system/backend/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// CreateReliefSupply - POSt
// http://localhost:8081/api/v1/relief-supplies
func CreateReliefSupply(w http.ResponseWriter, r *http.Request) {

	var supply models.ReliefSupply

	err := json.NewDecoder(r.Body).Decode(&supply)
	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	//validation
	if supply.ItemName == "" || supply.Category == "" || supply.Quantity <= 0 || supply.Unit == "" || supply.Location == "" {
		http.Error(w, `{"error":"Item name, category, quantity, unit and location are required fields"}`, http.StatusBadRequest)
		return
	}

	// Validate category
	validCategories := []string{"Food", "Medical", "Clothing", "Shelter", "Other"}

	isValidCategory := false
	for _, cat := range validCategories { //cat represents each value ("Food", "Medical", etc.)
		if supply.Category == cat {
			isValidCategory = true
			break
		}
	}

	if !isValidCategory {
		http.Error(w, `{"error":"Invalid category. Use: Food, Medical, Clothing, Shelter, Other"}`, http.StatusBadRequest)
		return
	}

	if supply.Status != "Available" &&
		supply.Status != "Distributed" &&
		supply.Status != "Expired" {
		http.Error(w, `{"error":"Invalid Status"}`, http.StatusBadRequest)
		return
	}

	// Save to database
	db := config.GetDB()
	result := db.Create(&supply)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to create relief supply"}`, http.StatusInternalServerError)
		return
	}

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(supply)

}

//GetAllReliefSupplies - GET

func GetAllReliefSupplies(w http.ResponseWriter, r *http.Request) {

	var supplies []models.ReliefSupply

	db := config.GetDB()

	// Fetch all supplies ordered by newest first
	result := db.Order("created_at DESC").Find(&supplies)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to fetch relief supplies"}`, http.StatusInternalServerError)
	}

	// return empty array if not any records
	if len(supplies) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return

	}

	//success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(supplies)

}

// GetReliefSupplyByID - GET

func GetReliefSupplyById(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r) // Get ID from URL
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	// Find supply by ID
	var supply models.ReliefSupply
	db := config.GetDB()

	result := db.First(&supply, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Relief supply not found"}`, http.StatusBadRequest)
	}

	//// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(supply)

}

// UpdateReliefSupply - PUT
func UpdateReliefSupply(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)                 // Get ID from URL
	id, err := strconv.Atoi(vars["id"]) // id came by string and convert to  Int

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	// Find existing supply
	var existingSupply models.ReliefSupply
	db := config.GetDB()
	result := db.First(&existingSupply, id)

	if result.Error != nil { //nil → means NO error
		http.Error(w, `{"error":"Relief supply not found"}`, http.StatusNotFound)
		return
	}

	// Decode update data
	var updateData models.ReliefSupply
	err = json.NewDecoder(r.Body).Decode(&updateData) //json -> go struct

	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Update fields if provided
	if updateData.ItemName != "" {
		existingSupply.ItemName = updateData.ItemName
	}

	if updateData.Category != "" {
		validCategories := []string{"Food", "Medical", "Clothing", "Shelter", "Other"}
		isValid := false
		for _, item := range validCategories {
			if updateData.Category == item {
				isValid = true
				break
			}

		}

		if !isValid {
			http.Error(w, `{"error":"Invalid category"}`, http.StatusBadRequest)
			return
		}
		existingSupply.Category = updateData.Category
	}

	if updateData.Quantity > 0 {
		existingSupply.Quantity = updateData.Quantity
	}

	if updateData.Unit != "" {
		existingSupply.Unit = updateData.Unit
	}

	if updateData.DonorName != "" {
		existingSupply.DonorName = updateData.DonorName
	}

	if updateData.DonorPhone != "" {
		existingSupply.DonorPhone = updateData.DonorPhone
	}

	if updateData.Location != "" {
		existingSupply.Location = updateData.Location
	}

	if updateData.Status != "" {
		if updateData.Status != "Available" &&
			updateData.Status != "Distributed" &&
			updateData.Status != "Expired" {
		}
		existingSupply.Status = updateData.Status
	}

	if updateData.Notes != "" {
		existingSupply.Notes = updateData.Notes
	}

	// Save updates
	result = db.Save(&existingSupply)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to update relief supply"}`, http.StatusInternalServerError)
		return
	}

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingSupply)

}

//DeleteReliefSupply - DELETE

func DeleteReliefSupply(w http.ResponseWriter, r *http.Request) {

	//Get ID from URL
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	//Check if supply exists
	var supply models.ReliefSupply
	db := config.GetDB()

	//Store the database result inside result variable
	result := db.First(&supply, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Relief supply not found"}`, http.StatusNotFound)
		return
	}

	// Delete supply
	result = db.Delete(&supply)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to delete relief supply"}`, http.StatusInternalServerError)
		return
	}

	//send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Relief supply deleted successfully"}`))

}

// GetSuppliesByCategory
// Bonus: Filter supplies by category
func GetSuppliesByCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	category := vars["category"]

	var supplies []models.ReliefSupply
	db := config.GetDB()

	result := db.Where("category = ?", category).Order("created_at DESC").Find(&supplies)

	if result.Error != nil {
		http.Error(w, `{"error":"Failed to fetch supplies by category"}`, http.StatusInternalServerError)
		return
	}

	if len(supplies) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(supplies)

}

// ...existing code...

// Get only available supplies
func GetAvailableSupplies(w http.ResponseWriter, r *http.Request) {

	var supplies []models.ReliefSupply
	db := config.GetDB()

	result := db.Where("status = ?", "Available").Order("created_at DESC").Find(&supplies)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to fetch available supplies"}`, http.StatusInternalServerError)
		return
	}

	if len(supplies) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(supplies)

}
