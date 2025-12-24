package controllers

import (
	"encoding/json" /*Clients send data as JSON
	  Server responds with JSON*/

	"flood-relief-system/backend/config"
	"flood-relief-system/backend/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// CreateHelpRequest  POST/help-request
//http://localhost:8081/api/v1/help-requests

func CreateHelperRequest(w http.ResponseWriter, r *http.Request) {

	var helpRequest models.HelpRequest //crate object from model
	//If JSON is correct → err = nil

	err := json.NewDecoder(r.Body).Decode(&helpRequest)
	//NewDecoder = Read the JSON coming from r.Body
	//Decode = Convert this JSON into your Go struct

	//If JSON is wrong → err != nil*/
	if err != nil {

		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Step 2: Validate required fields
	if helpRequest.Name == "" || helpRequest.Phone == "" || helpRequest.Location == "" {
		http.Error(w, `{"error":"Name, phone, and location are required"}`, http.StatusBadRequest)
		return
	}

	// Step 3: Set default status if not provided
	if helpRequest.Status == "" {
		helpRequest.Status = "pending"
	}

	//Set default priority if not provided
	if helpRequest.Priority == "" {
		helpRequest.Priority = "medium"
	}

	// NEW: Validate priority value
	validPriorities := []string{"low", "medium", "high", "critical"}
	isValidPriority := false

	for _, priority := range validPriorities {
		if helpRequest.Priority == priority {
			isValidPriority = true
			break
		}
	}

	if !isValidPriority {
		http.Error(w, `{"error":"Invalid priority. Use: low, medium, high, critical"}`, http.StatusBadRequest)
		return
	}

	// Step 4: Save to database
	db := config.GetDB()
	result := db.Create(&helpRequest)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to create help request"}`, http.StatusInternalServerError)
		return
	}

	// Step 5: Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(helpRequest)

}

// AllGetHelpRequests  GET/help-requests
// http://localhost:8081/api/v1/help-requests
func GetAllHelpRequests(w http.ResponseWriter, r *http.Request) {

	// Get data in to array
	var helpRequests []models.HelpRequest

	// Get database connection
	db := config.GetDB()

	//Query database - fetch all records,orderd by newest first
	result := db.Order("created_at DESC").Find(&helpRequests)

	// Check for database errors
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to fetch help requests"}`, http.StatusInternalServerError)
		return
	}

	//Return empty array if no records found
	if len(helpRequests) == 0 {
		w.Header().Set("Content-Type", "application/json") //Set metadata like content-type
		w.WriteHeader(http.StatusOK)                       //Set status code (200, 400, 500)
		w.Write([]byte(`[]`))                              //Send data body
		return
	}

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(helpRequests)
}

//Get only one help request by ID
//http://localhost:8081/api/v1/help-requests/id

func GetHelpRequestByID(w http.ResponseWriter, r *http.Request) {

	//Get ID from URL parameter
	vars := mux.Vars(r)
	idStr := vars["id"]

	//Convert ID from string to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	// Find help request by ID in database
	var helpRequest models.HelpRequest
	db := config.GetDB()

	result := db.First(&helpRequest, id)

	// Step 4: Check if record was found
	if result.Error != nil {
		http.Error(w, `{"error":"Help request not found"}`, http.StatusNotFound)
	}

	//Send success response with the found record
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(helpRequest)

}

// UpdateHelpRequestStatus
// http://localhost:8081/api/v1/help-requests/id
func UpdateHelpRequest(w http.ResponseWriter, r *http.Request) {

	//Get ID from URL parameter
	vars := mux.Vars(r)
	idStr := vars["id"]

	// Convert ID from string to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"Invalid ID fromat"}`, http.StatusInternalServerError)
		return
	}

	// Find existing help request in database
	var existingRequest models.HelpRequest
	db := config.GetDB()

	result := db.First(&existingRequest, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Help request not found"}`, http.StatusNotFound)
		return
	}

	//Decode new data from request body
	var updateData models.HelpRequest
	err = json.NewDecoder(r.Body).Decode(&updateData)
	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	//Update only fields that are provided

	if updateData.Name != "" {
		existingRequest.Name = updateData.Name
	}

	if updateData.Phone != "" {
		existingRequest.Phone = updateData.Phone
	}

	if updateData.Location != "" {
		existingRequest.Location = updateData.Location
	}

	if updateData.Description != "" {
		existingRequest.Description = updateData.Description
	}

	if updateData.Priority != "" {
		validPriorities := []string{"low", "medium", "high", "critical"}
		isValidPriority := false
		for _, priority := range validPriorities {
			if updateData.Priority == priority {
				isValidPriority = true
				break
			}
		}

		if !isValidPriority {
			http.Error(w, `{"error","Invalid Status use"}`, http.StatusBadRequest)
			return
		}
	}

	if updateData.Status != "" {
		// Validate status value
		if updateData.Status != "pending" && updateData.Status != "in-progress" && updateData.Status != "completed" {
			http.Error(w, `{"error":"Invalid status. Use ; pending, in-progress, or completed"}`, http.StatusBadRequest)
			return
		}
		existingRequest.Status = updateData.Status
	}

	// Save updated data to database
	result = db.Save(&existingRequest)

	if result.Error != nil {
		http.Error(w, `{"error":"Failed to update help request"}`, http.StatusInternalServerError)
		return
	}

	//Send success response with updated data
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingRequest)

}

// DeleteHelpRequest
// http://localhost:8081/api/v1/help-requests/id
func DeleteHelpRequest(w http.ResponseWriter, r *http.Request) {

	//Get ID from URL parameter

	vars := mux.Vars(r) /*mux.Vars(r) gets all route parameters.
	  vars["id"] extracts the "id" from URL.*/
	idStr := vars["id"]

	//Convert ID from string to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	//Check if help request exists
	var helpRequest models.HelpRequest
	db := config.GetDB()

	result := db.First(&helpRequest, id) //Find the record with this ID.
	if result.Error != nil {
		http.Error(w, `{"error":"Help request not found"}`, http.StatusNotFound)
		return
		//If no record found → return 404 Not Found.

	}

	// Delete the help request from database
	result = db.Delete(&helpRequest)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to delete help request"}`, http.StatusInternalServerError)
		return
	}

	//Send success response (204 No Content)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Help  request deleted successfully"}`))

}
