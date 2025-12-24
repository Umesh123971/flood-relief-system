import { useState, useEffect } from 'react';
import { helpRequestsAPI } from '../services/api';

function HelpRequests() {
   // STATE MANAGEMENT
   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showForm, setShowForm] = useState(false);
   const [editingRequest, setEditingRequest] = useState(null);

   // FORM DATA STATE
   const [formData, setFormData] = useState({
      name: '',
      phone: '',
      location: '',
      description: '',
      priority: 'medium',
      status: 'pending'
   });

   // SEARCH & FILTER STATE
   const [searchTerm, setSearchTerm] = useState('');
   const [filterPriority, setFilterPriority] = useState('all');
   const [filterStatus, setFilterStatus] = useState('all');

   // PAGINATION STATE
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   // FILTERED & PAGINATED DATA
   const filteredRequests = requests.filter(request => {
      const matchesSearch = 
         request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         request.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         request.phone?.includes(searchTerm);
      
      const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
   });

   const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

   // HANDLE INPUT CHANGES
   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   // FETCH ALL REQUESTS
   const fetchHelpRequests = async () => {
      try {
         setLoading(true);
         setError(null);
         const response = await helpRequestsAPI.getAll();
         setRequests(response.data || []);
      } catch (err) {
         console.error('Error fetching help requests:', err)
         setError('Failed to load help requests');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchHelpRequests();
   }, []);

   // CREATE OR UPDATE REQUEST
   const handleSubmit = async (e) => {
      e.preventDefault();
      if (editingRequest) return handleUpdate(e);

      try {
         if (!formData.name || !formData.phone || !formData.location) {
            alert('❌ Name, phone, and location are required!');
            return;
         }

         await helpRequestsAPI.create(formData);
         alert('✅ Help request created successfully!');

         setFormData({
            name: '',
            phone: '',
            location: '',
            description: '',
            priority: 'medium',
            status: 'pending'
         });
         setShowForm(false);
         fetchHelpRequests();
      } catch (err) {
         console.error('Error creating help request:', err);
         alert('❌ Failed to create help request');
      }
   };

   // UPDATE EXISTING REQUEST
   const handleEdit = (request) => {
      setEditingRequest(request);
      setFormData({
         name: request.name,
         phone: request.phone,
         location: request.location,
         description: request.description || '',
         priority: request.priority,
         status: request.status
      });
      setShowForm(true);
   };

   const handleUpdate = async (e) => {
      e.preventDefault();
      try {
         if (!formData.name || !formData.phone || !formData.location) {
            alert('❌ Name, phone, and location are required!');
            return;
         }

         await helpRequestsAPI.update(editingRequest.id, formData);
         alert('✅ Help request updated successfully!');

         setFormData({
            name: '',
            phone: '',
            location: '',
            description: '',
            priority: 'medium',
            status: 'pending'
         });
         setEditingRequest(null);
         setShowForm(false);
         fetchHelpRequests();
      } catch (err) {
         console.error('Error updating help requests', err);
         alert('❌ Failed to update help request');
      }
   };

   const handleCancelEdit = () => {
      setFormData({
         name: '',
         phone: '',
         location: '',
         description: '',
         priority: 'medium',
         status: 'pending'
      });
      setEditingRequest(null);
      setShowForm(false);
   };

   // DELETE REQUEST
   const handleDelete = async (id) => {
      if (!window.confirm('⚠️ Are you sure you want to delete this request?')) return;

      try {
         await helpRequestsAPI.delete(id);
         alert('✅ Help request deleted successfully!');
         fetchHelpRequests();
      } catch (err) {
         console.error('Error deleting help requests', err);
         alert('❌ Failed to delete help request');
      }
   };

   // EXPORT TO CSV
   const exportToCSV = () => {
      if (filteredRequests.length === 0) {
         alert('❌ No data to export!');
         return;
      }

      const headers = ['ID', 'Name', 'Phone', 'Location', 'Description', 'Priority', 'Status'];
      const rows = filteredRequests.map(request => [
         request.id,
         request.name,
         request.phone,
         request.location,
         request.description || '',
         request.priority,
         request.status
      ]);

      const csvContent = [
         headers.join(','),
         ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `help-requests-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
   };

   // LOADING STATE
   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600 text-lg">Loading...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-bold text-gray-800">📋 Help Requests</h1>
               <p className="text-gray-600 mt-1">Total: {filteredRequests.length} of {requests.length}</p>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={exportToCSV}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition"
               >
                  📥 Export
               </button>
               <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
               >
                  {showForm ? '✕ Close' : '➕ New Request'}
               </button>
            </div>
         </div>

         {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
               ❌ {error}
            </div>
         )}

         {/* Search & Filters */}
         <div className="mb-6 space-y-4">
            <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="🔍 Search by name, location, or phone..."
               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
               </select>

               <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
               </select>
            </div>
         </div>

         {/* CREATE/EDIT FORM */}
         {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
               <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  {editingRequest ? '✏️ Edit Help Request' : '➕ Create New Help Request'}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                     />
                  </div>

                  {/* Location Field */}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter location"
                     />
                  </div>

                  {/* Description Field */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Description
                     </label>
                     <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe the situation..."
                     ></textarea>
                  </div>

                  {/* Priority & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Priority */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Priority
                        </label>
                        <select
                           name="priority"
                           value={formData.priority}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                           <option value="pending">Pending</option>
                           <option value="in-progress">In Progress</option>
                           <option value="completed">Completed</option>
                        </select>
                     </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                     <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                     >
                        {editingRequest ? '💾 Update Request' : '➕ Create Request'}
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

         {/* TABLE - Display All Requests */}
         <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
               <thead className="bg-gray-100">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Priority</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {paginatedRequests.length === 0 ? (
                     <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                           <div className="text-6xl mb-4">📭</div>
                           <p className="text-lg">No help requests found</p>
                           <p className="text-sm mt-2">Click "New Request" to create one</p>
                        </td>
                     </tr>
                  ) : (
                     paginatedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 text-sm text-gray-900">#{request.id}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">{request.name}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">{request.phone}</td>
                           <td className="px-6 py-4 text-sm text-gray-900">{request.location}</td>
                           <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {request.description || 'No description'}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                 request.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                 request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                 request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-green-100 text-green-800'
                              }`}>
                                 {request.priority}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                 request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                 request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                 request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                 'bg-gray-100 text-gray-800'
                              }`}>
                                 {request.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium space-x-2">
                              <button
                                 onClick={() => handleEdit(request)}
                                 className="text-blue-600 hover:text-blue-900"
                              >
                                 ✏️ Edit
                              </button>
                              <button
                                 onClick={() => handleDelete(request.id)}
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

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
                  <div className="text-sm text-gray-600">
                     Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length}
                  </div>
                  <div className="flex gap-2">
                     <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
                     >
                        ← Previous
                     </button>
                     <span className="px-4 py-2 bg-white border rounded-lg">
                        Page {currentPage} of {totalPages}
                     </span>
                     <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
                     >
                        Next →
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

export default HelpRequests;