import { useState, useEffect } from 'react';
import { emergencyContactsAPI } from '../services/api';

function EmergencyContacts() {
  
   // STATE MANAGEMENT
   const [contacts, setContacts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showForm, setShowForm] = useState(false);
   const [editingContact, setEditingContact] = useState(null);

   // FORM DATA STATE - ✅ FIXED: Changed to match backend field names
   const [formData, setFormData] = useState({
      organization_name: '',
      service_type: 'Medical',      // ✅ Changed default to match backend
      contact_person: '',
      phone: '',                     
      alternate_phone: '',           
      email: '',
      address: '',
      is_active: true                
   });

   // ✅ DEFINE SERVICE TYPES THAT MATCH BACKEND
   const SERVICE_TYPES = [
      { value: 'Medical', label: '🏥 Medical', icon: '🏥' },
      { value: 'Rescue', label: '🚁 Rescue', icon: '🚁' },
      { value: 'Food', label: '🍲 Food', icon: '🍲' },
      { value: 'Shelter', label: '🏠 Shelter', icon: '🏠' },
      { value: 'Police', label: '🚔 Police', icon: '🚔' },
      { value: 'Fire', label: '🚒 Fire', icon: '🚒' },
      { value: 'Other', label: '📞 Other', icon: '📞' }
   ];

   // FETCH ALL EMERGENCY CONTACTS (READ)
   const fetchContacts = async () => {
   try {
      console.log('📡 Fetching emergency contacts...');
      setLoading(true);
      setError(null);

      const response = await emergencyContactsAPI.getAll();
      
      // ✅ ADD SAFETY CHECK
      const contactsData = Array.isArray(response.data) 
         ? response.data 
         : [];
      
      setContacts(contactsData);
      console.log('✅ Fetched', contactsData.length, 'contacts');

   } catch (err) {
      console.error('❌ Error:', err);
      setError('Failed to load emergency contacts. Make sure backend is running.');
   } finally {
      setLoading(false);
   }
};

   useEffect(() => {
      fetchContacts();
   }, []);

   // HANDLE INPUT CHANGES
   const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      
      setFormData(prev => ({
         ...prev,
         [name]: type === 'checkbox' ? checked : value
      }));

      console.log(`📝 ${name} = ${type === 'checkbox' ? checked : value}`);
   };

   // CREATE CONTACT
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (editingContact) {
         return handleUpdate(e);
      }

      try {
         console.log('📤 Creating new contact...', formData);

         // ✅ Updated validation - phone instead of phone_number
         if (!formData.organization_name || !formData.phone || !formData.contact_person) {
            alert('❌ Organization name, phone, and contact person are required!');
            return;
         }

         await emergencyContactsAPI.create(formData);
         console.log('✅ Contact created successfully!');
         alert('✅ Emergency contact created successfully!');

         // ✅ Reset with correct field names
         setFormData({
            organization_name: '',
            service_type: 'Medical',
            contact_person: '',
            phone: '',
            alternate_phone: '',
            email: '',
            address: '',
            is_active: true
         });

         setShowForm(false);
         fetchContacts();

      } catch (err) {
         console.error('❌ Error creating contact:', err);
         alert('❌ Failed to create emergency contact. Check console for details.');
      }
   };

   // UPDATE EXISTING CONTACT
   const handleEdit = (contact) => {
      console.log('✏️ Editing contact:', contact);

      setEditingContact(contact);

      // ✅ Fill form with correct field names
      setFormData({
         organization_name: contact.organization_name,
         service_type: contact.service_type,
         contact_person: contact.contact_person,
         phone: contact.phone,
         alternate_phone: contact.alternate_phone || '',
         email: contact.email || '',
         address: contact.address || '',
         is_active: contact.is_active
      });

      setShowForm(true);
   };

   // SAVE UPDATED CONTACT
   const handleUpdate = async (e) => {
      e.preventDefault();

      try {
         console.log('📤 Updating contact ID:', editingContact.id, formData);

         if (!formData.organization_name || !formData.phone || !formData.contact_person) {
            alert('❌ Organization name, phone, and contact person are required!');
            return;
         }

         await emergencyContactsAPI.update(editingContact.id, formData);
         console.log('✅ Contact updated successfully!');
         alert('✅ Emergency contact updated successfully!');

         setFormData({
            organization_name: '',
            service_type: 'Medical',
            contact_person: '',
            phone: '',
            alternate_phone: '',
            email: '',
            address: '',
            is_active: true
         });

         setEditingContact(null);
         setShowForm(false);
         fetchContacts();

      } catch (err) {
         console.error('❌ Error updating contact:', err);
         alert('❌ Failed to update emergency contact. Check console for details.');
      }
   };

   // CANCEL EDITING
   const handleCancelEdit = () => {
      setFormData({
         organization_name: '',
         service_type: 'Medical',
         contact_person: '',
         phone: '',
         alternate_phone: '',
         email: '',
         address: '',
         is_active: true
      });
      setEditingContact(null);
      setShowForm(false);
   };

   // DELETE CONTACT
   const handleDelete = async (id) => {
      if (!window.confirm('⚠️ Are you sure you want to delete this emergency contact?')) {
         return;
      }

      try {
         console.log('🗑️ Deleting contact ID:', id);
         await emergencyContactsAPI.delete(id);
         console.log('✅ Contact deleted successfully!');
         alert('✅ Emergency contact deleted successfully!');
         fetchContacts();

      } catch (err) {
         console.error('❌ Error deleting contact:', err);
         alert('❌ Failed to delete emergency contact. Check console for details.');
      }
   };

   // QUICK CALL FUNCTION
   const handleCall = (phoneNumber) => {
      window.location.href = `tel:${phoneNumber}`;
   };

   // ✅ GET SERVICE TYPE ICON - Now uses SERVICE_TYPES array
   const getServiceIcon = (serviceType) => {
      const service = SERVICE_TYPES.find(s => s.value === serviceType);
      return service ? service.icon : '📞';
   };

   // LOADING STATE
   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
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
               <h1 className="text-3xl font-bold text-gray-800">📞 Emergency Contacts</h1>
               <p className="text-gray-600 mt-1">
                  Total: {contacts.length} | Active: {contacts.filter(c => c.is_active).length}
               </p>
            </div>
            <button
               onClick={() => setShowForm(!showForm)}
               className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
               {showForm ? '✕ Close Form' : '➕ Add Contact'}
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
                  {editingContact ? '✏️ Edit Emergency Contact' : '➕ Add New Emergency Contact'}
               </h2>

               <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Organization Name */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Organization Name <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., City Police Station"
                     />
                  </div>

                  {/* Service Type & Active Status - ✅ FIXED */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Service Type */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Service Type
                        </label>
                        <select
                           name="service_type"
                           value={formData.service_type}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                           {SERVICE_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                 {type.label}
                              </option>
                           ))}
                        </select>
                     </div>

                     {/* Active Status - ✅ Changed to boolean */}
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Active Status
                        </label>
                        <select
                           name="is_active"
                           value={formData.is_active}
                           onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.value === 'true'}))}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                           <option value="true">✅ Active</option>
                           <option value="false">❌ Inactive</option>
                        </select>
                     </div>
                  </div>

                  {/* Contact Person */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Contact Person <span className="text-red-500">*</span>
                     </label>
                     <input
                        type="text"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter contact person name"
                     />
                  </div>

                  {/* Phone & Alternate Phone - ✅ FIXED FIELD NAMES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="tel"
                           name="phone"
                           value={formData.phone}
                           onChange={handleInputChange}
                           required
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Enter phone number"
                        />
                     </div>

                     <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                           Alternate Phone
                        </label>
                        <input
                           type="tel"
                           name="alternate_phone"
                           value={formData.alternate_phone}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Enter alternate phone"
                        />
                     </div>
                  </div>

                  {/* Email */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Email
                     </label>
                     <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter email address"
                     />
                  </div>

                  {/* Address */}
                  <div>
                     <label className="block text-gray-700 font-semibold mb-2">
                        Address
                     </label>
                     <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter full address"
                     ></textarea>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                     <button
                        type="submit"
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                     >
                        {editingContact ? '💾 Update Contact' : '➕ Add Contact'}
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

         {/* CONTACTS GRID - ✅ FIXED TO USE CORRECT FIELD NAMES */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.length === 0 ? (
               <div className="col-span-3 text-center py-16">
                  <div className="text-6xl mb-4">📞</div>
                  <p className="text-lg text-gray-500">No emergency contacts found</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Add Contact" to create one</p>
               </div>
            ) : (
               contacts.map((contact) => (
                  <div key={contact.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                           <span className="text-3xl">{getServiceIcon(contact.service_type)}</span>
                           <div>
                              <h3 className="font-bold text-gray-800 text-lg">{contact.organization_name}</h3>
                              <span className="text-xs text-gray-500 uppercase">{contact.service_type}</span>
                           </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                           contact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                           {contact.is_active ? 'Active' : 'Inactive'}
                        </span>
                     </div>

                     <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-700">
                           <span className="text-sm">👤 {contact.contact_person}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                           <span className="text-sm font-semibold">📞 {contact.phone}</span>
                        </div>
                        {contact.alternate_phone && (
                           <div className="flex items-center text-gray-600">
                              <span className="text-xs">📱 {contact.alternate_phone}</span>
                           </div>
                        )}
                        {contact.email && (
                           <div className="flex items-center text-gray-600">
                              <span className="text-xs">✉️ {contact.email}</span>
                           </div>
                        )}
                        {contact.address && (
                           <div className="flex items-center text-gray-600">
                              <span className="text-xs">📍 {contact.address}</span>
                           </div>
                        )}
                     </div>

                     <div className="flex gap-2">
                        <button
                           onClick={() => handleCall(contact.phone)}
                           className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                        >
                           📞 Call Now
                        </button>
                        <button
                           onClick={() => handleEdit(contact)}
                           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                        >
                           ✏️
                        </button>
                        <button
                           onClick={() => handleDelete(contact.id)}
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

export default EmergencyContacts;