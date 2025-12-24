import { useState, useEffect } from 'react';
import { reliefSuppliesAPI } from '../services/api';

function ReliefSupplies() {
   // ========================================
   // STATE MANAGEMENT
   // ========================================
   const [supplies, setSupplies] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showForm, setShowForm] = useState(false);
   const [editingSupply, setEditingSupply] = useState(null);

   // FORM DATA STATE
   const [formData, setFormData] = useState({
      item_name: '',
      category: 'food',
      quantity: 0,
      unit: 'kg',
      donor_name: '',
      storage_location: '',
      is_available: true
   });

   // ========================================
   // FETCH ALL SUPPLIES (READ)
   // ========================================
   const fetchSupplies = async () => {
      try {
         console.log('📡 Fetching relief supplies...');
         setLoading(true);
         setError(null);

         const response = await reliefSuppliesAPI.getAll();

         setSupplies(response.data || []);
         console.log('✅ Fetched', response.data.length, 'supplies');

      } catch (err) {
         console.error('❌ Error:', err);
         setError('Failed to load relief supplies. Make sure backend is running.');

      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchSupplies();
   }, []);

   // ========================================
   // HANDLE INPUT CHANGES
   // ========================================
   const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;

      setFormData(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? checked : value
      }));

      console.log(`📝 ${name} = ${type === 'checkbox' ? checked : value}`);
   };

   // ========================================
   // CREATE OR UPDATE SUPPLY
   // ========================================
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (editingSupply) {
         return handleUpdate(e);
      }

      try {
         console.log('📤 Creating new supply...', formData);

         if (!formData.item_name || !formData.quantity) {
            alert('❌ Item name and quantity are required!');
            return;
         }

         await reliefSuppliesAPI.create(formData);

         console.log('✅ Supply created successfully!');
         alert('✅ Relief supply created successfully!');

         setFormData({
            item_name: '',
            category: 'food',
            quantity: 0,
            unit: 'kg',
            donor_name: '',
            storage_location: '',
            is_available: true
         });

         setShowForm(false);
         fetchSupplies();

      } catch (err) {
         console.error('❌ Error creating supply:', err);
         alert('❌ Failed to create relief supply. Check console for details.');
      }
   };

   // ========================================
   // UPDATE EXISTING SUPPLY
   // ========================================
   const handleEdit = (supply) => {
      console.log('✏️ Editing supply:', supply);

      setEditingSupply(supply);

      setFormData({
         item_name: supply.item_name,
         category: supply.category,
         quantity: supply.quantity,
         unit: supply.unit,
         donor_name: supply.donor_name || '',
         storage_location: supply.storage_location || '',
         is_available: supply.is_available
      });

      setShowForm(true);
   };

   const handleUpdate = async (e) => {
      e.preventDefault();

      try {
         console.log('📤 Updating supply ID:', editingSupply.id, formData);

         if (!formData.item_name || !formData.quantity) {
            alert('❌ Item name and quantity are required!');
            return;
         }

         await reliefSuppliesAPI.update(editingSupply.id, formData);

         console.log('✅ Supply updated successfully!');
         alert('✅ Relief supply updated successfully!');

         setFormData({
            item_name: '',
            category: 'food',
            quantity: 0,
            unit: 'kg',
            donor_name: '',
            storage_location: '',
            is_available: true
         });

         setEditingSupply(null);
         setShowForm(false);
         fetchSupplies();

      } catch (err) {
         console.error('❌ Error updating supply:', err);
         alert('❌ Failed to update relief supply. Check console for details.');
      }
   };

   // ========================================
   // CANCEL EDITING
   // ========================================
   const handleCancelEdit = () => {
      setFormData({
         item_name: '',
         category: 'food',
         quantity: 0,
         unit: 'kg',
         donor_name: '',
         storage_location: '',
         is_available: true
      });
      setEditingSupply(null);
      setShowForm(false);
   };

   // ========================================
   // DELETE SUPPLY
   // ========================================
   const handleDelete = async (id) => {
      if (!window.confirm('⚠️ Are you sure you want to delete this supply?')) {
         return;
      }

      try {
         console.log('🗑️ Deleting supply ID:', id);

         await reliefSuppliesAPI.delete(id);

         console.log('✅ Supply deleted successfully!');
         alert('✅ Relief supply deleted successfully!');

         fetchSupplies();

      } catch (err) {
         console.error('❌ Error deleting supply:', err);
         alert('❌ Failed to delete relief supply. Check console for details.');
      }
   };

   // ========================================
   // GET CATEGORY ICON
   // ========================================
   const getCategoryIcon = (category) => {
      const icons = {
         food: '🍲',
         water: '💧',
         medicine: '💊',
         clothing: '👕',
         shelter: '⛺',
         other: '📦'
      };
      return icons[category] || '📦';
   };

   // ========================================
   // LOADING STATE
   // ========================================
   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
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
               <h1 className="text-3xl font-bold text-gray-800">📦 Relief Supplies</h1>
               <p className="text-gray-600 mt-1">Total: {supplies.length} | Available: {supplies.filter(s => s.is_available).length}</p>
            </div>
            <button
               onClick={() => setShowForm(!showForm)}
               className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
               {showForm ? '✕ Close Form' : '➕ Add Supply'}
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
                  {editingSupply ? '✏️ Edit Relief Supply' : '➕ Add New Relief Supply'}
               </h2>

               <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Item Name */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Item Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="item_name"
                        value={formData.item_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Rice, Bottled Water"
                     />
                  </div>

                  {/* Category & Unit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Category
                        </label>
                        <select
                           name="category"
                           value={formData.category}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                           <option value="food">🍲 Food</option>
                           <option value="water">💧 Water</option>
                           <option value="medicine">💊 Medicine</option>
                           <option value="clothing">👕 Clothing</option>
                           <option value="shelter">⛺ Shelter</option>
                           <option value="other">📦 Other</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Unit
                        </label>
                        <select
                           name="unit"
                           value={formData.unit}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                           <option value="kg">Kg</option>
                           <option value="liters">Liters</option>
                           <option value="pieces">Pieces</option>
                           <option value="boxes">Boxes</option>
                           <option value="packets">Packets</option>
                        </select>
                     </div>
                  </div>

                  {/* Quantity */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Quantity <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter quantity"
                     />
                  </div>

                  {/* Donor Name */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Donor Name
                     </label>
                     <input
                        type="text"
                        name="donor_name"
                        value={formData.donor_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter donor name"
                     />
                  </div>

                  {/* Storage Location */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Storage Location
                     </label>
                     <input
                        type="text"
                        name="storage_location"
                        value={formData.storage_location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter storage location"
                     />
                  </div>

                  {/* Availability Checkbox */}
                  <div className="flex items-center">
                     <input
                        type="checkbox"
                        name="is_available"
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                     />
                     <label className="ml-2 text-gray-700 font-semibold">
                        Available for Distribution
                     </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                     <button
                        type="submit"
                        className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                     >
                        {editingSupply ? '💾 Update Supply' : '➕ Add Supply'}
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

         {/* SUPPLIES GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supplies.length === 0 ? (
               <div className="col-span-3 text-center py-16">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg text-gray-500">No relief supplies found</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Add Supply" to create one</p>
               </div>
            ) : (
               supplies.map((supply) => (
                  <div key={supply.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
                     {/* Header */}
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                           <span className="text-3xl">{getCategoryIcon(supply.category)}</span>
                           <div>
                              <h3 className="font-bold text-gray-800 text-lg">{supply.item_name}</h3>
                              <span className="text-xs text-gray-500 uppercase">{supply.category}</span>
                           </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                           supply.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                           {supply.is_available ? 'Available' : 'Unavailable'}
                        </span>
                     </div>

                     {/* Details */}
                     <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-700">
                           <span className="text-sm font-semibold">📊 {supply.quantity} {supply.unit}</span>
                        </div>
                        {supply.donor_name && (
                           <div className="flex items-center text-gray-600">
                              <span className="text-xs">🤝 Donor: {supply.donor_name}</span>
                           </div>
                        )}
                        {supply.storage_location && (
                           <div className="flex items-center text-gray-600">
                              <span className="text-xs">📍 {supply.storage_location}</span>
                           </div>
                        )}
                     </div>

                     {/* Actions */}
                     <div className="flex gap-2">
                        <button
                           onClick={() => handleEdit(supply)}
                           className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                        >
                           ✏️ Edit
                        </button>
                        <button
                           onClick={() => handleDelete(supply.id)}
                           className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                        >
                           🗑️
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
}

export default ReliefSupplies;