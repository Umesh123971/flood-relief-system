package controllers

import (
	"encoding/json"
	"flood-relief-system/backend/config"
	"flood-relief-system/backend/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// CreateEmergencyContact - POST
// http://localhost:8081/api/v1/emergency-contact
func CreateEmergencyContact(w http.ResponseWriter, r *http.Request) {

	var contact models.EmergencyContact

	// Decode
	err := json.NewDecoder(r.Body).Decode(&contact)
	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	//Validation OrganizationName & Phone are required

	if contact.OrganizationName == "" || contact.Phone == "" {
		http.Error(w, `{"error":"Organization Name & Phone are required fields"}`, http.StatusBadRequest)
		return
	}

	// Validation ServiceType
	validServiceTypes := []string{"Medical", "Rescue", "Food", "Shelter", "Plice", "Fire", "Other"}

	isValidServiceType := false
	for _, service := range validServiceTypes {
		if contact.ServiceType == service {
			isValidServiceType = true
			break
		}
	}

	if contact.ServiceType != "" && !isValidServiceType {
		http.Error(w, `{"error":"Invalid Service Type"}`, http.StatusBadRequest)
		return
	}

	// Set default is_active if not provided
	if !contact.IsActive {
		contact.IsActive = true
	}

	// Save to DB
	db := config.GetDB()
	result := db.Create(&contact)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to create emergency contact"}`, http.StatusInternalServerError)
		return
	}

	//success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(contact)

}

// GetAllEmergencyContacts - GET
func GetAllEmergencyContacts(w http.ResponseWriter, r *http.Request) {
	var contacts []models.EmergencyContact
	db := config.GetDB()

	// Fetch all
	result := db.Order("organization_name ASC").Find(&contacts)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to retrieve emergency contacts"}`, http.StatusInternalServerError)
		return
	}

	//if no records - return empty array
	if len(contacts) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return
	}

	//success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(contacts)

}

// GetEmergencyContactByID - GET
func GetEmergencyContactByID(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	// Find contact by ID
	var contact models.EmergencyContact
	db := config.GetDB()

	result := db.First(&contact, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Emergency contact not found"}`, http.StatusNotFound)
		return
	}

	// success msg
	w.Header().Set("Contact-Type", "application.json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(contact)

}

// UpdateEmergencyContact - PUT
func UpdateEmergencyContact(w http.ResponseWriter, r *http.Request) {

	// Get ID from URL
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	// Find existing contact
	var existingContact models.EmergencyContact
	db := config.GetDB()

	result := db.First(&existingContact, id)
	if result.Error != nil {
		http.Error(w, `{"error":"Emergency contact not found"}`, http.StatusNotFound)
		return
	}

	// Decode
	var updateData models.EmergencyContact
	err = json.NewDecoder(r.Body).Decode(&updateData)
	if err != nil {
		http.Error(w, `{"error":"Invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Update Fields
	if updateData.OrganizationName != "" {

		existingContact.OrganizationName = updateData.OrganizationName
	}

	if updateData.ContactPerson != "" {

		existingContact.ContactPerson = updateData.ContactPerson
	}

	if updateData.Phone != "" {

		existingContact.Phone = updateData.Phone
	}

	if updateData.AlternatePhone != "" {

		existingContact.AlternatePhone = updateData.AlternatePhone
	}

	if updateData.Email != "" {

		existingContact.Email = updateData.Email
	}

	if updateData.Address != "" {

		existingContact.Address = updateData.Address
	}

	if updateData.ServiceType != "" {
		validServiceTypes := []string{"Medical", "Rescue", "Food", "Shelter", "Police", "Fire", "Other"}
		isValid := false
		for _, service := range validServiceTypes {
			if updateData.ServiceType == service {
				isValid = true
				break
			}
		}

		if !isValid {
			http.Error(w, `{"error":"Invalid Service type"}`, http.StatusBadRequest)
			return
		}

		existingContact.ServiceType = updateData.ServiceType
	}

	existingContact.IsActive = updateData.IsActive

	// Save updated contact
	result = db.Save(&existingContact)
	if result.Error != nil {
		http.Error(w, `{"error":"Faild to update emergency contact data"}`, http.StatusInternalServerError)
		return
	}

	// succerss msg
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingContact)

}

// DeleteEmergencyContact - DELETE
func DeleteEmergencyContact(w http.ResponseWriter, r *http.Request) {
	//Get ID from URL
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, `{"error":"Invalid ID format"}`, http.StatusBadRequest)
		return
	}

	//Check if contact exists
	var contact models.EmergencyContact
	db := config.GetDB()
	result := db.First(&contact, id)

	if result.Error != nil {
		http.Error(w, `{"error":"Emergency contact not found"}`, http.StatusNotFound)
		return
	}

	//Delete contact
	result = db.Delete(&contact)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to delete emergency contact"}`, http.StatusInternalServerError)
		return
	}

	//Success msg
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Emergency Contact deleted successfully"}`))

}

// GetActiveContacts - GET
func GetActiveContacts(w http.ResponseWriter, r *http.Request) {
	var contacts []models.EmergencyContact
	db := config.GetDB()

	result := db.Where("is_active = ?", true).Order("organization_name ASC").Find(&contacts)
	if result.Error != nil {
		http.Error(w, `{"error":"Failed to retrive active emergency contacts"}`, http.StatusBadRequest)
		return
	}

	// empty records and then return emty array
	if len(contacts) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return

	}

	//Success msg
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(contacts)

}

// GetContactsByServiceType - GET
func GetContactsByServiceType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serviceType := vars["service_type"]

	// Validate service type
	validServiceTypes := []string{"Medical", "Rescue", "Food", "Shelter", "Police", "Fire", "Other"}
	isValid := false
	for _, service := range validServiceTypes {
		if serviceType == service { //servuice Type -> client send
			//service -> assigend value

			isValid = true
			break
		}
	}

	if !isValid {
		http.Error(w, `{"Error","Invalid  Service Type"}`, http.StatusBadRequest)
		return

	}

	//using with [] -> Can hold zero, one, or many contacts.
	var contacts []models.EmergencyContact
	db := config.GetDB()

	result := db.Where("service_type = ? AND is_active = ?", serviceType, true).Order("organization_name ASC").Find(&contacts)

	if result.Error != nil {
		http.Error(w, `{"error","Failed to fetch contacts by service type"}`, http.StatusBadRequest)
		return
	}

	if len(contacts) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`[]`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(contacts)

}
