import { useState, useEffect } from 'react';
import { rescueOperationsAPI } from '../services/api';

function RescueOperations() {
   // ========================================
   // STATE MANAGEMENT
   // ========================================
   const [operations, setOperations] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showForm, setShowForm] = useState(false);
   const [editingOperation, setEditingOperation] = useState(null);

   // FORM DATA STATE
   const [formData, setFormData] = useState({
      operation_name: '',
      location: '',
      operation_type: 'rescue',
      priority: 'medium',
      status: 'active',
      team_size: 0,
      start_time: '',
      description: ''
   });

   // ========================================
   // FETCH ALL RESCUE OPERATIONS (READ)
   // ========================================
   const fetchOperations = async () => {
      try {
         console.log('📡 Fetching rescue operations...');
         setLoading(true);
         setError(null);

         // Call backend API (GET http://localhost:8081/api/v1/rescue-operations)
         const response = await rescueOperationsAPI.getAll();

         setOperations(response.data || []);
         console.log('✅ Fetched', response.data.length, 'operations');

      } catch (err) {
         console.error('❌ Error:', err);
         setError('Failed to load rescue operations. Make sure backend is running.');

      } finally {
         setLoading(false);
      }
   };

   // Run when page loads
   useEffect(() => {
      fetchOperations();
   }, []);

   // ========================================
   // HANDLE INPUT CHANGES
   // ========================================
   const handleInputChange = (e) => {
      const { name, value } = e.target;

      setFormData(prev => ({
         ...prev,
         [name]: value
      }));

      console.log(`📝 ${name} = ${value}`);
   };

   // ========================================
   // CREATE OR UPDATE OPERATION
   // ========================================
   const handleSubmit = async (e) => {
      e.preventDefault();

      // If editing, use UPDATE function
      if (editingOperation) {
         return handleUpdate(e);
      }

      // Otherwise, CREATE new operation
      try {
         console.log('📤 Creating new operation...', formData);

         // Validate required fields
         if (!formData.operation_name || !formData.location || !formData.start_time) {
            alert('❌ Operation name, location, and start time are required!');
            return;
         }

         // Call backend API (POST http://localhost:8081/api/v1/rescue-operations)
         await rescueOperationsAPI.create(formData);

         console.log('✅ Operation created successfully!');
         alert('✅ Rescue operation created successfully!');

         // Reset form
         setFormData({
            operation_name: '',
            location: '',
            operation_type: 'rescue',
            priority: 'medium',
            status: 'active',
            team_size: 0,
            start_time: '',
            description: ''
         });

         // Hide form
         setShowForm(false);

         // Refresh list
         fetchOperations();

      } catch (err) {
         console.error('❌ Error creating operation:', err);
         alert('❌ Failed to create rescue operation. Check console for details.');
      }
   };

   // ========================================
   // UPDATE EXISTING OPERATION
   // ========================================
   const handleEdit = (operation) => {
      console.log('✏️ Editing operation:', operation);

      // Set the operation being edited
      setEditingOperation(operation);

      // Convert start_time to datetime-local format
      const startTime = operation.start_time ? new Date(operation.start_time).toISOString().slice(0, 16) : '';

      // Fill form with existing data
      setFormData({
         operation_name: operation.operation_name,
         location: operation.location,
         operation_type: operation.operation_type,
         priority: operation.priority,
         status: operation.status,
         team_size: operation.team_size || 0,
         start_time: startTime,
         description: operation.description || ''
      });

      // Show form
      setShowForm(true);
   };

   // SAVE UPDATED OPERATION
   const handleUpdate = async (e) => {
      e.preventDefault();

      try {
         console.log('📤 Updating operation ID:', editingOperation.id, formData);

         // Validate required fields
         if (!formData.operation_name || !formData.location || !formData.start_time) {
            alert('❌ Operation name, location, and start time are required!');
            return;
         }

         // Call backend API (PUT http://localhost:8081/api/v1/rescue-operations/:id)
         await rescueOperationsAPI.update(editingOperation.id, formData);

         console.log('✅ Operation updated successfully!');
         alert('✅ Rescue operation updated successfully!');

         // Reset form
         setFormData({
            operation_name: '',
            location: '',
            operation_type: 'rescue',
            priority: 'medium',
            status: 'active',
            team_size: 0,
            start_time: '',
            description: ''
         });

         // Clear editing state
         setEditingOperation(null);

         // Hide form
         setShowForm(false);

         // Refresh list
         fetchOperations();

      } catch (err) {
         console.error('❌ Error updating operation:', err);
         alert('❌ Failed to update rescue operation. Check console for details.');
      }
   };

   // ========================================
   // CANCEL EDITING
   // ========================================
   const handleCancelEdit = () => {
      setFormData({
         operation_name: '',
         location: '',
         operation_type: 'rescue',
         priority: 'medium',
         status: 'active',
         team_size: 0,
         start_time: '',
         description: ''
      });
      setEditingOperation(null);
      setShowForm(false);
   };

   // ========================================
   // DELETE OPERATION
   // ========================================
   const handleDelete = async (id) => {
      // Confirmation dialog
      if (!window.confirm('⚠️ Are you sure you want to delete this rescue operation?')) {
         return;
      }

      try {
         console.log('🗑️ Deleting operation ID:', id);

         // Call backend API (DELETE http://localhost:8081/api/v1/rescue-operations/:id)
         await rescueOperationsAPI.delete(id);

         console.log('✅ Operation deleted successfully!');
         alert('✅ Rescue operation deleted successfully!');

         // Refresh list
         fetchOperations();

      } catch (err) {
         console.error('❌ Error deleting operation:', err);
         alert('❌ Failed to delete rescue operation. Check console for details.');
      }
   };

   // ========================================
   // LOADING STATE
   // ========================================
   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
               <p className="mt-4 text-gray-600 text-lg">Loading...</p>
            </div>
         </div>
      );
   }

   // ========================================
   // RENDER UI
   // ========================================
   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-bold text-gray-800">🚁 Rescue Operations</h1>
               <p className="text-gray-600 mt-1">Total: {operations.length} | Active: {operations.filter(o => o.status === 'active').length}</p>
            </div>
            <button
               onClick={() => setShowForm(!showForm)}
               className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
               {showForm ? '✕ Close Form' : '➕ New Operation'}
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
                  {editingOperation ? '✏️ Edit Rescue Operation' : '➕ Create New Rescue Operation'}
               </h2>

               <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Operation Name */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Operation Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="operation_name"
                        value={formData.operation_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Operation Flood Relief Zone A"
                     />
                  </div>

                  {/* Location & Start Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Location */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Location <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="text"
                           name="location"
                           value={formData.location}
                           onChange={handleInputChange}
                           required
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                           placeholder="Enter location"
                        />
                     </div>

                     {/* Start Time */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="datetime-local"
                           name="start_time"
                           value={formData.start_time}
                           onChange={handleInputChange}
                           required
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                     </div>
                  </div>

                  {/* Operation Type, Priority, Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {/* Operation Type */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Operation Type
                        </label>
                        <select
                           name="operation_type"
                           value={formData.operation_type}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                           <option value="rescue">🚁 Rescue</option>
                           <option value="evacuation">🚶 Evacuation</option>
                           <option value="relief">📦 Relief Distribution</option>
                           <option value="medical">🏥 Medical</option>
                           <option value="search">🔍 Search</option>
                        </select>
                     </div>

                     {/* Priority */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Priority
                        </label>
                        <select
                           name="priority"
                           value={formData.priority}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                           <option value="low">Low</option>
                           <option value="medium">Medium</option>
                           <option value="high">High</option>
                           <option value="critical">Critical</option>
                        </select>
                     </div>

                     {/* Status */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Status
                        </label>
                        <select
                           name="status"
                           value={formData.status}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                           <option value="active">Active</option>
                           <option value="completed">Completed</option>
                           <option value="cancelled">Cancelled</option>
                        </select>
                     </div>
                  </div>

                  {/* Team Size */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Team Size
                     </label>
                     <input
                        type="number"
                        name="team_size"
                        value={formData.team_size}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Number of team members"
                     />
                  </div>

                  {/* Description */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Description
                     </label>
                     <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Describe the operation..."
                     ></textarea>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                     <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                     >
                        {editingOperation ? '💾 Update Operation' : '➕ Create Operation'}
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

         {/* TABLE - Display All Operations */}
         <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
               <thead className="bg-gray-100">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Operation Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Start Time</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Team Size</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Priority</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {operations.length === 0 ? (
                     <tr>
                        <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                           <div className="text-6xl mb-4">🚁</div>
                           <p className="text-lg">No rescue operations found</p>
                           <p className="text-sm mt-2">Click "New Operation" to create one</p>
                        </td>
                     </tr>
                  ) : (
                     operations.map((operation) => (
                        <tr key={operation.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 text-sm text-gray-900">#{operation.id}</td>
                           <td className="px-6 py-4 text-sm font-semibold text-gray-900">{operation.operation_name}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">
                              {operation.operation_type === 'rescue' && '🚁'}
                              {operation.operation_type === 'evacuation' && '🚶'}
                              {operation.operation_type === 'relief' && '📦'}
                              {operation.operation_type === 'medical' && '🏥'}
                              {operation.operation_type === 'search' && '🔍'}
                              {' '}{operation.operation_type}
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-900">{operation.location}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">
                              {operation.start_time ? new Date(operation.start_time).toLocaleString() : 'N/A'}
                           </td>
                           <td className="px-6 py-4 text-sm text-gray-900">{operation.team_size || 0} members</td>
                           <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                 operation.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                 operation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                 operation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-green-100 text-green-800'
                              }`}>
                                 {operation.priority}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                 operation.status === 'active' ? 'bg-green-100 text-green-800' :
                                 operation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                 'bg-gray-100 text-gray-800'
                              }`}>
                                 {operation.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium space-x-2">
                              <button
                                 onClick={() => handleEdit(operation)}
                                 className="text-blue-600 hover:text-blue-900"
                              >
                                 ✏️ Edit
                              </button>
                              <button
                                 onClick={() => handleDelete(operation.id)}
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

export default RescueOperations;