package controllers

import (
	"encoding/json"
	"flood-relief-system/backend/config"
	"flood-relief-system/backend/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// CreateVolunteer POST
//http://localhost:8081/api/v1/volunteers

func CreateVolunteer(w http.ResponseWriter, r *http.Request) {
	//This creates a variable named volunteer using your models's struct Volunteer
	var volunteer models.Volunteer

	//Reads JSON from the request (r.Body)
	//NewDecoder = Read the JSON coming from the frontend.
	//Decode = Take the JSON data and put it into the volunteer struct.”
	//frontend eken arn backend ekt denwa (simply)
	err := json.NewDecoder(r.Body).Decode(&volunteer)

	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Validate required fields
	if volunteer.Name == "" || volunteer.Email == "" || volunteer.Phone == "" {
		http.Error(w, `{"error":"Name, email and phone are required"}`, http.StatusBadRequest)
		return
	}

	// set default status
	if volunteer.Status == "" {
		volunteer.Status = "active"
	}

	db := config.GetDB()
	result := db.Create(&volunteer)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to ragister volunteer"}`, http.StatusInternalServerError)
		return //Meaning of 500 INTERNAL SERVER ERROR
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) //A new record was successfully created
	json.NewEncoder(w).Encode(volunteer)

}

// GetAllVolunteers - GET
// http://localhost:8081/api/v1/volunteers
func GetAllVolunteers(w http.ResponseWriter, r *http.Request) {

	var volunteers []models.Volunteer
	db := config.GetDB()

	//database all data arn desc order ekt denwa
	result := db.Order("Created_at DESC").Find(&volunteers)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to fetch volunteers"}`, http.StatusInternalServerError)
		return
	}

	if len(volunteers) == 0 {
		w.Header().Set("Content-Type", "application/json") //means you are sending JSON data.
		w.WriteHeader(http.StatusOK)                       //I received your request, processed it successfully, and here is the result.
		w.Write([]byte(`[]`))                              //Send an empty JSON array as the response.”

	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)          //successful
	json.NewEncoder(w).Encode(volunteers) //convert Go data → JSON

}

//Get SingleVolunteer - GET

func GetVolunteerByID(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r) //Get the values from the URL
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	var volunteer models.Volunteer
	db := config.GetDB()

	result := db.First(&volunteer, id) //db.first = Find the volunteer with this ID and store it in the volunteer variable
	if result.Error != nil {
		http.Error(w, `{"error":"Volunteer not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(volunteer) //go  data -> json

}

// UpdateVolunteer - PUT
// http://localhost:8081/api/v1/volunteers/1
func UpdateVolunteer(w http.ResponseWriter, r *http.Request) {

	//w is used to send a response back to the client.
	//r represents the incoming request from the client.

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	var existingVolunteer models.Volunteer
	db := config.GetDB()

	result := db.First(&existingVolunteer, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Volunteer not found"}`, http.StatusNotFound)
		return
	}

	var updateData models.Volunteer
	err = json.NewDecoder(r.Body).Decode(&updateData)

	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	//update fields

	if updateData.Name != "" {
		existingVolunteer.Name = updateData.Name
	}

	if updateData.Email != "" {
		existingVolunteer.Email = updateData.Email
	}

	if updateData.Phone != "" {
		existingVolunteer.Phone = updateData.Phone
	}

	if updateData.Skills != "" {
		existingVolunteer.Skills = updateData.Skills
	}

	if updateData.Availability != "" {
		existingVolunteer.Availability = updateData.Availability
	}

	if updateData.Location != "" {
		existingVolunteer.Location = updateData.Location
	}

	if updateData.Status != "" {
		if updateData.Status != "active" && updateData.Status != "inactive" && updateData.Status != "on-duty" {
			http.Error(w, `{"error":"Invalid status value"}`, http.StatusBadRequest)
			return
		}

		existingVolunteer.Status = updateData.Status
	}

	result = db.Save(&existingVolunteer)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to update volunteer"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingVolunteer)

}

//DeleteVolunteer - DELETE

func DeleteVolunteer(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	var volunteer models.Volunteer
	db := config.GetDB()

	result := db.First(&volunteer, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Volunteer not found"}`, http.StatusNotFound)
		return
	}

	result = db.Delete(&volunteer)

	if result.Error != nil {
		http.Error(w, `{"error":"Failed to delete volunteer"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)                                    // message http success ek set krnwa
	w.Write([]byte(`{"message":"Volunteer deleted successfully"}`)) //success message ek

}
