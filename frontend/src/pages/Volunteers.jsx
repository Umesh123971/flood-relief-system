import { useState, useEffect } from 'react';
import { volunteersAPI } from '../services/api';

 function Volunteers(){
     // STATE MANAGEMENT

     const [volunteers, setVolunteers] = useState([]); // Stores the list of volunteers fetched from the backend
     const [loading, setLoading] = useState(true); // Tracks whether data is loading
     const [error, setError]= useState(null); // Stores any error message when fetching data or performing an action fails
     const [showForm, setShowForm] = useState(false); // Tracks whether a form
     const [editingVolunteer, setEditingVolunteer] = useState (null);

     
     // FORM DATA STATE
     const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        skills: '',
        availability: 'available'
     });


     
           // HANDLE INPUT CHANGES
          //To capture and store what the user types into input fields
         // To keep form data in React state
         
          const handleInputChange = (e) => {
            const { name, value} = e.target;

            setFormData(prev => ({
                ...prev, //Copies all existing field
                [name]:value
               //email: value

            }));
            console.log(`${name} = ${value}`);
          };







    // FETCH ALL VOLUNTEERS (READ)
    const fetchVolunteers = async () =>{
        try {
            console.log('📡 Fetching volunteers...');
            setLoading(true);
            setError(null); //To clear old errors before starting a new API request
        
            // Call backend API (GET http://localhost:8081/api/v1/volunteers)
            const response = await volunteersAPI.getAll();
          
            setVolunteers (response.data || []);
            console.log('✅ Fetched volunteers', response.data.length, 'volunteers');
                                                //.length → number of items in that array + volunteers
                        
        } catch(err){
            console.error('Error',err); //Used only for developers, not users
            setError('Failed to load volunteers. Make sure backend is running');
        } finally {
            setLoading(false); //steop loading data
        }

    };
          // Run when page loads
          useEffect(()=>{
            fetchVolunteers();
         },[]);







      // CREATE OR UPDATE VOLUNTEER
      
      //async → allows you to use await for API calls
      const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page relaod on form submit
     
     // If editing, use UPDATE function
        if (editingVolunteer){
            return handleUpdate(e);
        }
    
     //Otherwise, CREATE new volunteer
        try {
            console.log('📤 Creating new volunteer...',formData)
        
     // Validate required fields
        if (!formData.name || !formData.email || !formData.phone){
           alert('❌ Name, phone, and email are required!');
           return;
        }
        
        
    
     //Call backend API (POST http://localhost:8081/api/v1/volunteers)
        await volunteersAPI.create(formData);
        alert('✅ Volunteer created successfully!');
    
     // Reset form
        setFormData({
            name:'',
            phone:'',
            email:'',
            skills:'',
            availability:'available'
        });

     // Hide form
        setShowForm(false);

     // Refresh list
        fetchVolunteers();



    }catch (err){
        console.error('Failed to create volunteer', err)
        alert('❌ Failed to create volunteer. Check console for details.');

    }
 };


    
     // UPDATE EXISTING VOLUNTEER

     const handleEdit = (volunteer) => {
                     // By passing volunteer -> User clicked edit on THIS volunteer”
        console.log('Editing volunteer:',volunteer)

        // Set the volunteer being edited
        setEditingVolunteer(volunteer);

        // Fill the volunteer being edited 
        setFormData({
            name: volunteer.name,
            phone: volunteer.phone,
            email: volunteer.emails,
            skills: volunteer.skills || '',
            availability: volunteer.availability 
        });

     // Show form
     setShowForm (true);

};
       
   // SAVE UPDATED VOLUNTEER
   const handleUpdate = async (e) => {
    e.preventDefault();

    try {
        
        // Validate required fields

        if (!formData.name || !formData.email || !formData.phone) {
            alert('Name,phone & email are required !')
            return;
        }

        // Call backend API (PUT http://localhost:8081/api/v1/volunteers/:id)
        await volunteersAPI.update(editingVolunteer.id, formData);
        alert ('✅ Volunteer updated successfully!');

        // Reset form
        setFormData({
            name:'',
            phone:'',
            email:'',
            skills:'',
            availability:'available'

        });
        
        // Clear editing state
        setEditingVolunteer(null);

        // Hide form
        setShowForm(false);

        // Refresh list
        fetchVolunteers();


    }catch (err) {
        console.error('Failed to update volunteer', err);
        alert('❌ Failed to update volunteer. Check console for details.');

    }

};

     // CANCEL EDITING
     const handleCancelEdit = () => {
        setFormData({
            name:'',
            phone:'',
            emails:'',
            skills:'',
            availability:'available'
        });
        setEditingVolunteer(null);
        setShowForm(false);
     };





    // DELETE VOLUNTEER
     const handleDelete = async (id) => {
        //Confirmation dialog
        if (!window.confirm ('⚠️ Are you sure you want to delete this volunteer?')){
            return;
        }
  
        try {
            console.log('Deleting volunteer ID:',id);
        

            // Call backend API (DELETE)
            await volunteersAPI.delete(id);
            alert('✅ Volunteer deleted successfully!');

            // Refresh list
            fetchVolunteers();


        }catch (err) {
            console.error('Error deleting volunteer:', err);
            alert('❌ Failed to delete volunteer. Check console for details.');
        }
       

};



   // LOADING STATE
    if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
               <p className="mt-4 text-gray-600 text-lg">Loading...</p>
            </div>
         </div>
      );
   }





     return(
         <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-bold text-gray-800">👥 Volunteers</h1>
               <p className="text-gray-600 mt-1">Total: {volunteers.length}</p>
            </div>
            <button
               onClick={() => setShowForm(!showForm)}
               className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
               {showForm ? '✕ Close Form' : '➕ New Volunteer'}
            </button>
         </div>

         {/* Error Message */}
         {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
               ❌ {error}
            </div>
         )}

           {/* CREATE/EDIT FORM */}
         {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
               <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  {editingVolunteer ? '✏️ Edit Volunteer' : '➕ Register New Volunteer'}
               </h2>

               <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter volunteer name"
                     />
                  </div>

                  {/* Phone Field */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Phone <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter phone number"
                     />
                  </div>

            {/* Email Field */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Email <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter email address"
                     />
                  </div>


              {/* Skills Field */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Skills
                     </label>
                     <textarea
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="E.g., First Aid, Driving, Cooking..."
                     ></textarea>
                  </div>

               {/* Availability Field */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Availability
                     </label>
                     <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                     </select>
                  </div>



                   {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                     <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                     >
                        {editingVolunteer ? '💾 Update Volunteer' : '➕ Register Volunteer'}
                     </button>
                     <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
                     >
                        ✕ Cancel
                     </button>
                  </div>
               </form>
            </div>
         )}










          {/* TABLE - Display All Volunteers */}
         <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
               <thead className="bg-gray-100">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Skills</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Availability</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
               </thead>


            <tbody className="divide-y divide-gray-200">
                  {volunteers.length === 0 ? (
                     <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                           <div className="text-6xl mb-4">👥</div>
                           <p className="text-lg">No volunteers found</p>
                           <p className="text-sm mt-2">Click "New Volunteer" to register one</p>
                        </td>
                     </tr>
                  ) : (
                     volunteers.map((volunteer) => (
                        <tr key={volunteer.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 text-sm text-gray-900">#{volunteer.id}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">{volunteer.name}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">{volunteer.phone}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">{volunteer.email}</td>
                           <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {volunteer.skills || 'No skills listed'}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                 volunteer.availability === 'available' ? 'bg-green-100 text-green-800' :
                                 volunteer.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-red-100 text-red-800'


  }`}>
                                 {volunteer.availability}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium space-x-2">
                              <button
                                 onClick={() => handleEdit(volunteer)}
                                 className="text-blue-600 hover:text-blue-900"
                              >
                                 ✏️ Edit
                              </button>
                              <button
                                 onClick={() => handleDelete(volunteer.id)}
                                 className="text-red-600 hover:text-red-900"
                              >
                                 🗑️ Delete
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
           </table>
         </div>
      </div>
   );
}

export default Volunteers;


