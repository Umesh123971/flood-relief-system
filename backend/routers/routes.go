package routes

import (
	"flood-relief-system/backend/controllers"
	"net/http"

	"github.com/gorilla/mux"
)

// SetupRoutes configures all API routes
func SetupRoutes() *mux.Router {
	// Create new Gorilla Mux router
	router := mux.NewRouter()

	// API version prefix
	api := router.PathPrefix("/api/v1").Subrouter()

	// Health check endpoint (no authentication needed)
	// frontend eken connection ek check karanne meken
	api.HandleFunc("/health", HealthCheck).Methods("GET")

	// // Help Requests Routes

	// CREATE - Add new help request
	api.HandleFunc("/help-requests", controllers.CreateHelperRequest).Methods("POST")

	// READ - Get all help requests
	api.HandleFunc("/help-requests", controllers.GetAllHelpRequests).Methods("GET")

	// READ ONE - Get single help request by ID
	api.HandleFunc("/help-requests/{id}", controllers.GetHelpRequestByID).Methods("GET")

	// UPDATE - Update help request by ID
	api.HandleFunc("/help-requests/{id}", controllers.UpdateHelpRequest).Methods("PUT")

	// DELETE - Delete help request by ID
	api.HandleFunc("/help-requests/{id}", controllers.DeleteHelpRequest).Methods("DELETE")

	// Volunteer Routes

	// CREATE - Register new volunteer
	api.HandleFunc("/volunteers", controllers.CreateVolunteer).Methods("POST")
	api.HandleFunc("/volunteers", controllers.GetAllVolunteers).Methods("GET")
	api.HandleFunc("/volunteers/{id}", controllers.GetVolunteerByID).Methods("GET")
	api.HandleFunc("/volunteers/{id}", controllers.UpdateVolunteer).Methods("PUT")
	api.HandleFunc("/volunteers/{id}", controllers.DeleteVolunteer).Methods("DELETE")

	// Relief Supplies
	// CREATE - Relief Supplies
	api.HandleFunc("/relief-supplies", controllers.CreateReliefSupply).Methods("POST")
	api.HandleFunc("/relief-supplies", controllers.GetAllReliefSupplies).Methods("GET")
	api.HandleFunc("/relief-supplies/{id}", controllers.GetReliefSupplyById).Methods("GET")
	api.HandleFunc("/relief-supplies/{id}", controllers.UpdateReliefSupply).Methods("PUT")
	api.HandleFunc("/relief-supplies/{id}", controllers.DeleteReliefSupply).Methods("DELETE")
	// Bonus: Get only available supplies
	api.HandleFunc("/relief-supplies/category/{category}", controllers.GetSuppliesByCategory).Methods("GET")
	api.HandleFunc("/relief-supplies/available/{available}", controllers.GetAvailableSupplies).Methods("GET")

	// Rescue Operations Routes
	//CREATE - Rescue Operation
	api.HandleFunc("/rescue-operations", controllers.CreateRescueOperation).Methods("POST")
	api.HandleFunc("/rescue-operations", controllers.GetAllRescueOperations).Methods("GET")
	api.HandleFunc("/rescue-operations/{id}", controllers.GetRescueOperationByID).Methods("GET")
	api.HandleFunc("/rescue-operations/{id}", controllers.UpdateRescueOperation).Methods("PUT")
	api.HandleFunc("/rescue-operations/{id}", controllers.DeleteRescueOperation).Methods("DELETE")
	//Bones -> Get Active Operation by Priority
	api.HandleFunc("/rescue-operations/status/active", controllers.GetActiveOperations).Methods("GET")
	api.HandleFunc("/rescue-operations/priority/{priority}", controllers.GetOperationsByPriority).Methods("GET")

	// Emergency Contacts Routes
	// CREATE - Emergency Contact
	api.HandleFunc("/emergency-contacts", controllers.CreateEmergencyContact).Methods("POST")
	api.HandleFunc("/emergency-contacts", controllers.GetAllEmergencyContacts).Methods("GET")
	api.HandleFunc("/emergency-contacts/{id}", controllers.GetEmergencyContactByID).Methods("GET")
	api.HandleFunc("/emergency-contacts/{id}", controllers.UpdateEmergencyContact).Methods("PUT")
	api.HandleFunc("/emergency-contacts/{id}", controllers.DeleteEmergencyContact).Methods("DELETE")
	// Bonus: Get only active contacts
	api.HandleFunc("/emergency-contacts/status/active", controllers.GetActiveContacts).Methods("GET")
	api.HandleFunc("/emergency-contacts/service/{service_type}", controllers.GetContactsByServiceType).Methods("GET")

	return router
}

// HealthCheck returns server status
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"OK","message":"Flood Relief System API is running"}`))
}
