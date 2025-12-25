import axios from 'axios'; //

//Backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

// Create an Axios instance
// Used to call backend APIs

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json' //means:“I am sending JSON data
    },
});

// Test connection between frontend & backend
export const testConnection = async () => {
    try {
        const response = await api.get('/health') //backend eke router eke 
        console.log('✅ Backend connected:', response.data);
        return response.data;

    }catch (error){
         console.error('❌ Backend connection failed:', error.message);
         throw error;
    }
};



// Help Requests API
export const helpRequestsAPI = {
     // POST create new help request
     create : (data) => api.post('/help-requests', data),

     // GET all help requests
     getAll : () => api.get('/help-requests'),

     // GET help request by ID
     getById : (id) => api.get(`/help-requests/${id}`), 

     // PUT update help request by ID
     update : (id, data) => api.put(`/help-requests/${id}`, data),

     // DELETE help request by ID
     delete : (id) => api.delete(`/help-requests/${id}`),

};


// Volunteers API
export  const volunteersAPI = {
    // POST create new volunteer
    create: (data) => api.post('/volunteers',data),

    // GET all volunteers
    getAll: () => api.get('/volunteers'),

    // GET volunteers by ID
    getById: (id) => api.get(`/volunteers/${id}`),

    // PUT update volunteers By ID
    update: (id, data) =>api.put(`/volunteers/${id}`, data),
    
    // DELETE volunteer by ID
    delete: (id) => api.delete(`/volunteers/${id}`),
};


// Emergency Contacts API
export const emergencyContactsAPI = {
    // POST 
    create: (data) => api.post('/emergency-contacts', data),

    // GET ALL
    getAll: () => api.get('/emergency-contacts'),

    // GET by ID
    getById: (id) => api.get(`/emergency-contacts/${id}`),

    // PUT update by ID
    update: (id, data) => api.put(`/emergency-contacts/${id}`,data),
    
    // DELETE by ID
    delete: (id) => api.delete(`/emergency-contacts/${id}`),

    // GET active contacts
    getActive: () => api.get('/emergency-contacts/status/active'),

    // GET contacts by servuce type
    getByServiceType: (serviceType) => api.get(`/emergency-contacts/service/${serviceType}`) 

}




// RESCUE OPERATIONS API
export const rescueOperationsAPI = {
    // POST
    create: (data) => api.post('/rescue-operations',data),

    // GET ALL
    getAll: () => api.get('/rescue-operations'),

    // GET rescue operation by ID
    getById: (id) => api.get(`/rescue-operations/${id}`),

    // PUT update rescue operation by ID
    update: (id, data) => api.put(`/rescue-operations/${id}`, data),

    // DELETE 
    delete: (id) => api.delete(`/rescue-operations/${id}`),
    
    //GET active operations
    getActive: () => api.get('/rescue-operations/status/active'),  // ✅ ADD COMMA HERE!

    //GET operations by priority
    getByPriority: (priority) => api.get(`/rescue-operations/priority/${priority}`)
};


//  RELIEF SUPPLIES API
export const reliefSuppliesAPI = {
    // POST
    create: (data) => api.post('/relief-supplies',data),

    // GET all
    getAll: () => api.get('/relief-supplies'),

    // GET relief supply by ID
    getById: (id) => api.get(`/relief-supplies/${id}`),

    // PUT
    update: (id,data) => api.put(`/relief-supplies/${id}`,data),

    // DELETE
    delete: (id) => api.delete(`/relief-supplies/${id}`),

    //GET supplies by type
    getByCategory: (category) => api.get(`/relief-supplies/category/${category}`),

    //GET availbe suuppliers
    getAvaileble: () => api.get('/relief-supplies/availability/true')
}












export default api;