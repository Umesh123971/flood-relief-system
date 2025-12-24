package controllers

import (
	"encoding/json"
	"flood-relief-system/backend/config"
	"flood-relief-system/backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

// CreateRescueOperation - POST
// http://localhost:8081/api/v1/rescue-operations
func CreateRescueOperation(w http.ResponseWriter, r *http.Request) {

	var operation models.RescueOperation

	// Frontend ---> JSON ---> Backend ---> Decode ---> Go struct
	err := json.NewDecoder(r.Body).Decode(&operation)
	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Required fields
	if operation.OperationName == "" || operation.TeamSize <= 0 || operation.Location == "" {
		http.Error(w, `{"error":"Missing required fields"}`, http.StatusBadRequest)
		return
	}

	// Default help_request_id
	if operation.HelpRequestID == 0 {
		operation.HelpRequestID = 1
	}

	//validation status
	validStatuses := []string{"initiated", "in-progress", "completed", "failed"}
	isValidStatus := false
	for _, status := range validStatuses {
		if operation.Status == status {
			isValidStatus = true
			break
		}
	}
	if operation.Status == "" {
		operation.Status = "initiated"
	} else if !isValidStatus {
		http.Error(w, `{"error":"Invalid status value"}`, http.StatusBadRequest)
		return
	}

	//validation priority
	validPriorities := []string{"low", "medium", "high", "critical"}
	isValidPriority := false
	for _, priority := range validPriorities {
		if operation.Priority == priority {
			isValidPriority = true
			break
		}
	}

	if operation.Priority == "" {
		operation.Priority = "medium" // set default
	} else if !isValidPriority {
		http.Error(w, `{"error":"Invalid priority value"}`, http.StatusBadRequest)
	}

	// Set start time if not provided
	if operation.StartTime.IsZero() {
		operation.StartTime = time.Now()
	}

	// Save to DB
	db := config.GetDB()
	result := db.Create(&operation) //db.Create() = Add new record to database
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to create rescue operation"}`, http.StatusInternalServerError)
		return
	}

	//json.NewDecoder() = JSON → Go
	//json.NewEncoder() = Go → JSON
	//send successs message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(operation)
	//Backend ---> Go struct ---> Encode ---> JSON ---> Frontend

}

// GetAllRescueOperations - GET
// http://localhost:8081/api/v1/rescue-operations

func GetAllRescueOperations(w http.ResponseWriter, r *http.Request) {

	var operations []models.RescueOperation

	db := config.GetDB()
	result := db.Order("CASE WHEN priority = 'critical' THEN 1 WHEN priority = 'high' THEN 2 WHEN priority = 'medium' THEN 3 ELSE 4 END, start_time DESC").Find(&operations)

	// Fetch all operations ordered by priority (critical first) then start time
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to fetch rescue operations"}`, http.StatusInternalServerError)
		return

	}

	//Return empty array if no records
	if len(operations) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return

	}

	//send sucess message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(operations)

}

// Get Single RescueOperation - GET

func GetRescueOperationByID(w http.ResponseWriter, r *http.Request) {

	// Get ID from URL
	vars := mux.Vars(r) //mux.Vars(r) is used to read dynamic values from the URL path (like {id})

	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	// Find operation by ID
	var operation models.RescueOperation
	db := config.GetDB()

	result := db.First(&operation, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Rescue operation not found"}`, http.StatusNotFound)
		return
	}

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(operation)

}

func UpdateRescueOperation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	var existing models.RescueOperation
	db := config.GetDB()

	if err := db.First(&existing, id).Error; err != nil {
		http.Error(w, `{"error":"Rescue operation not found"}`, http.StatusNotFound)
		return
	}

	var update models.RescueOperation
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Update allowed fields
	if update.OperationName != "" {
		existing.OperationName = update.OperationName
	}
	if update.TeamSize > 0 {
		existing.TeamSize = update.TeamSize
	}
	if update.VehicleType != "" {
		existing.VehicleType = update.VehicleType
	}
	if update.Location != "" {
		existing.Location = update.Location
	}

	// Validate status
	if update.Status != "" {
		valid := map[string]bool{
			"initiated":   true,
			"in-progress": true,
			"completed":   true,
			"failed":      true,
		}
		if !valid[update.Status] {
			http.Error(w, `{"error":"Invalid status value"}`, http.StatusBadRequest)
			return
		}
		existing.Status = update.Status

		if (update.Status == "completed" || update.Status == "failed") && existing.EndTime == nil {
			now := time.Now()
			existing.EndTime = &now
		}
	}

	// Validate priority
	if update.Priority != "" {
		valid := map[string]bool{
			"low":      true,
			"medium":   true,
			"high":     true,
			"critical": true,
		}
		if !valid[update.Priority] {
			http.Error(w, `{"error":"Invalid priority"}`, http.StatusBadRequest)
			return
		}
		existing.Priority = update.Priority
	}

	if update.PeopleRescued >= 0 {
		existing.PeopleRescued = update.PeopleRescued
	}

	if update.EndTime != nil {
		existing.EndTime = update.EndTime
	}

	if err := db.Save(&existing).Error; err != nil {
		http.Error(w, `{"error":"Failed to update rescue operation"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existing)
}

// DeleteRescueOperation - DELETE
func DeleteRescueOperation(w http.ResponseWriter, r *http.Request) {

	//Get ID from URL
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	//Check if operation exists
	var operation models.RescueOperation
	db := config.GetDB()

	result := db.First(&operation, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to find rescue operation"}`, http.StatusNotFound)
		return
	}

	//Delete operation
	result = db.Delete(&operation)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to delete rescue operation"}`, http.StatusInternalServerError)
		return
	}

	//success message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Rescue operation deleted successfully"}`))

}

// GetActiveOperations - GET
func GetActiveOperations(w http.ResponseWriter, r *http.Request) {
	var operations []models.RescueOperation
	db := config.GetDB()

	/*
	  IN - Means “is this value inside this list?”
	*/
	//db eke initiated and in-progress kyna values thynwad balanawa status eke thynwa nan
	result := db.Where("status IN ?", []string{"initiated", "in-progress"}).Order("priority DESC, start_time DESC").Find(&operations)

	if result.Error != nil {
		http.Error(w, `{"error":"Failed to fetch active rescue operations"}`, http.StatusInternalServerError)
		return
	}

	if len(operations) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return
	}

	//success message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(operations)

}

// Get - GET
func GetOperationsByPriority(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	priority := vars["prioprity"]

	// Validate priority
	validPriorities := []string{"low", "medium", "high", "critical"}
	isValid := false

	for _, p := range validPriorities {
		if priority == p {
			isValid = true
			break
		}
	}

	if !isValid {
		http.Error(w, `{"error":"Invalid priority"}`, http.StatusBadRequest)
		return
	}

	var operations []models.RescueOperation
	db := config.GetDB()
	result := db.Where("priority = ?", priority).Order("start_time DESC").Find(&operations)

	if result.Error != nil {
		http.Error(w, `{"error":"Failes to fetch operations by priority"}`, http.StatusInternalServerError)
		return
	}

	if len(operations) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return
	}

	//success msg
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(operations)

}
