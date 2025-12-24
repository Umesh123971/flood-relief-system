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

	//validation
	if operation.HelpRequestID == 0 || operation.TeamSize <= 0 || operation.Location == "" {
		http.Error(w, `{"error":"Missing required fields"}`, http.StatusBadRequest)
		return
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

// UpdateRescueOperation - PUT
func UpdateRescueOperation(w http.ResponseWriter, r *http.Request) {

	// Get ID from URL
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	// Find existing operation
	var existingOperation models.RescueOperation
	db := config.GetDB()
	result := db.First(&existingOperation, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Rescue operation not found"}`, http.StatusNotFound)
		return
	}

	// Decode request body
	var updateData models.RescueOperation
	err = json.NewDecoder(r.Body).Decode(&updateData)

	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// update fields
	if updateData.TeamSize > 0 {
		existingOperation.TeamSize = updateData.TeamSize
	}
	if updateData.VehicleType != "" {
		existingOperation.VehicleType = updateData.VehicleType
	}
	if updateData.Location != "" {
		existingOperation.Location = updateData.Location
	}
	if updateData.Status != "" {
		validStatus := []string{"initiated", "in-progress", "completed", "failed"}
		isValid := false
		for _, status := range validStatus {
			if updateData.Status == status {
				isValid = true
				break
			}
		}
		if !isValid {
			http.Error(w, `{"error":"Invalid status Value"}`, http.StatusBadRequest)
			return
		}

		existingOperation.Status = updateData.Status

		// Auto-set end time when status is completed or failed
		if (updateData.Status == "completed" || updateData.Status == "failed") && existingOperation.EndTime == nil {
			now := time.Now()
			existingOperation.EndTime = &now
		}

	}

	if updateData.Priority != "" {
		validPriorities := []string{"low", "medium", "high", "critical"}
		isValid := false
		for _, priority := range validPriorities {
			if updateData.Priority == priority {
				isValid = true
				break
			}
		}
		if !isValid {
			http.Error(w, `{"error":"Invalid priority"}`, http.StatusBadRequest)
			return
		}
		existingOperation.Priority = updateData.Priority
	}
	if updateData.PeopleRescued >= 0 {
		existingOperation.PeopleRescued = updateData.PeopleRescued
	}

	if updateData.PeopleRescued > 0 {
		existingOperation.PeopleRescued = updateData.PeopleRescued

	}
	if updateData.EndTime != nil {
		existingOperation.EndTime = updateData.EndTime

	}

	// Save Updated operation
	result = db.Save(&existingOperation)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to update rescue operation"}`, http.StatusInternalServerError)
		return
	}

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingOperation)

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
