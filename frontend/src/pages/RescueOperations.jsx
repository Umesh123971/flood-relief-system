import { useState, useEffect } from 'react';
import { rescueOperationsAPI } from '../services/api';

function RescueOperations() {
   const [operations, setOperations] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showForm, setShowForm] = useState(false);
   const [editingOperation, setEditingOperation] = useState(null);

   // ✅ FIXED: team_size = 1, status = 'initiated'
   const [formData, setFormData] = useState({
      operation_name: '',
      location: '',
      operation_type: 'rescue',
      priority: 'medium',
      status: 'initiated',  // ✅ Changed from 'active'
      team_size: 1,         // ✅ Changed from 0
      start_time: '',
      description: '',
      help_request_id: 1  
   });

   const fetchOperations = async () => {
      try {
         console.log('📡 Fetching rescue operations...');
         setLoading(true);
         setError(null);

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

   useEffect(() => {
      fetchOperations();
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
      console.log(`📝 ${name} = ${value}`);
   };

   // ✅ FIXED: Added operation_name to payload
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (editingOperation) {
         return handleUpdate(e);
      }

      try {
         console.log('📤 Creating new operation...', formData);

         // Validation
         if (!formData.operation_name || !formData.location || !formData.start_time || formData.team_size <= 0) {
            alert('❌ Operation name, location, start time, and team size are required!');
            return;
         }

         // ✅ FIXED: Added operation_name
         const payload = {
            operation_name: formData.operation_name,  // ✅ ADDED!
            help_request_id: Number(formData.help_request_id) || 1,
            team_size: Number(formData.team_size),
            vehicle_type: formData.operation_type,
            location: formData.location,
            priority: formData.priority,
            status: formData.status,
            start_time: new Date(formData.start_time).toISOString()
         };

         console.log('📦 Payload sent to backend:', payload);

         await rescueOperationsAPI.create(payload);

         alert('✅ Rescue operation created successfully!');

         // ✅ FIXED: Reset with correct defaults
         setFormData({
            operation_name: '',
            location: '',
            operation_type: 'rescue',
            priority: 'medium',
            status: 'initiated',
            team_size: 1,
            start_time: '',
            description: '',
            help_request_id: 1
         });

         setShowForm(false);
         fetchOperations();

      } catch (err) {
         console.error('❌ Error creating operation:', err.response?.data || err);
         alert(`❌ Failed to create rescue operation: ${err.response?.data?.error || err.message}`);
      }
   };

   const handleEdit = (operation) => {
      console.log('✏️ Editing operation:', operation);
      setEditingOperation(operation);

      const startTime = operation.start_time ? new Date(operation.start_time).toISOString().slice(0, 16) : '';

      setFormData({
         operation_name: operation.operation_name || '',
         help_request_id: operation.help_request_id || 1,
         location: operation.location || '',
         operation_type: operation.vehicle_type || 'rescue',  // ✅ Using vehicle_type from backend
         priority: operation.priority || 'medium',
         status: operation.status || 'initiated',
         team_size: operation.team_size || 1,
         start_time: startTime,
         description: operation.description || ''
      });

      setShowForm(true);
   };

   const handleUpdate = async (e) => {
      e.preventDefault();

      try {
         console.log('📤 Updating operation ID:', editingOperation.id);

         if (!formData.operation_name || !formData.location || !formData.start_time || formData.team_size <= 0) {
            alert('❌ Operation name, location, start time, and team size are required!');
            return;
         }

         // ✅ FIXED: Includes operation_name
         const payload = {
            operation_name: formData.operation_name,
            help_request_id: Number(formData.help_request_id) || 1,
            team_size: Number(formData.team_size),
            vehicle_type: formData.operation_type,
            location: formData.location,
            priority: formData.priority,
            status: formData.status,
            start_time: new Date(formData.start_time).toISOString()
         };

         console.log('📦 Update payload:', payload);

         await rescueOperationsAPI.update(editingOperation.id, payload);

         alert('✅ Rescue operation updated successfully!');

         setEditingOperation(null);
         setShowForm(false);
         fetchOperations();

      } catch (err) {
         console.error('❌ Error updating operation:', err.response?.data || err);
         alert(`❌ Failed to update: ${err.response?.data?.error || err.message}`);
      }
   };

   const handleCancelEdit = () => {
      // ✅ FIXED: Correct defaults
      setFormData({
         operation_name: '',
         location: '',
         operation_type: 'rescue',
         priority: 'medium',
         status: 'initiated',
         team_size: 1,
         start_time: '',
         description: '',
         help_request_id: 1
      });
      setEditingOperation(null);
      setShowForm(false);
   };

   const handleDelete = async (id) => {
      if (!window.confirm('⚠️ Are you sure you want to delete this rescue operation?')) {
         return;
      }

      try {
         console.log('🗑️ Deleting operation ID:', id);
         await rescueOperationsAPI.delete(id);
         console.log('✅ Operation deleted successfully!');
         alert('✅ Rescue operation deleted successfully!');
         fetchOperations();
      } catch (err) {
         console.error('❌ Error deleting operation:', err);
         alert('❌ Failed to delete rescue operation. Check console for details.');
      }
   };

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

   return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-bold text-gray-800">🚁 Rescue Operations</h1>
               <p className="text-gray-600 mt-1">
                  Total: {operations.length} | Active: {operations.filter(o => o.status === 'initiated' || o.status === 'in-progress').length}
               </p>
            </div>
            <button
               onClick={() => setShowForm(!showForm)}
               className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
               {showForm ? '✕ Close Form' : '➕ New Operation'}
            </button>
         </div>

         {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
               ❌ {error}
            </div>
         )}

         {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
               <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  {editingOperation ? '✏️ Edit Rescue Operation' : '➕ Create New Rescue Operation'}
               </h2>

               <form onSubmit={handleSubmit} className="space-y-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                           <option value="low">🟢 Low</option>
                           <option value="medium">🟡 Medium</option>
                           <option value="high">🟠 High</option>
                           <option value="critical">🔴 Critical</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           🆔 Help Request ID
                        </label>
                        <input
                           type="number"
                           name="help_request_id"
                           value={formData.help_request_id}
                           onChange={handleInputChange}
                           required
                           min="1"
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                           placeholder="Enter help request ID"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                           💡 Link this operation to a help request
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Status
                        </label>
                        <select 
                           name="status" 
                           value={formData.status} 
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                           <option value="initiated">🔵 Initiated</option>
                           <option value="in-progress">🟡 In Progress</option>
                           <option value="completed">🟢 Completed</option>
                           <option value="failed">🔴 Failed</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Team Size <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="number"
                           name="team_size" 
                           value={formData.team_size}
                           onChange={handleInputChange}
                           required
                           min="1"   
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                           placeholder="Number of team members (minimum 1)"
                        />
                     </div>
                  </div>

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
                           {/* ✅ FIXED: Using vehicle_type from backend */}
                           <td className="px-6 py-4 text-sm text-gray-900">
                              {operation.vehicle_type === 'rescue' && '🚁'}
                              {operation.vehicle_type === 'evacuation' && '🚶'}
                              {operation.vehicle_type === 'relief' && '📦'}
                              {operation.vehicle_type === 'medical' && '🏥'}
                              {operation.vehicle_type === 'search' && '🔍'}
                              {' '}{operation.vehicle_type}
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
                                 operation.status === 'initiated' || operation.status === 'in-progress' ? 'bg-green-100 text-green-800' :
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