import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { helpRequestsAPI, volunteersAPI } from '../services/api';

function Home() {
   const [stats, setStats] = useState({
      totalRequests: 0,
      pendingRequests: 0,
      completedRequests: 0,
      totalVolunteers: 0,
      availableVolunteers: 0,
   });
   const [loading, setLoading] = useState(true);

   // Fetch statistics
  const fetchStats = async () => {
   try {
      setLoading(true);

      // Fetch help requests
      const requestsResponse = await helpRequestsAPI.getAll();
      // ✅ ADD SAFETY CHECK
      const requests = Array.isArray(requestsResponse.data) 
         ? requestsResponse.data 
         : [];

      // Fetch volunteers
      const volunteersResponse = await volunteersAPI.getAll();
      // ✅ ADD SAFETY CHECK
      const volunteers = Array.isArray(volunteersResponse.data) 
         ? volunteersResponse.data 
         : [];

      // Calculate statistics
      setStats({
         totalRequests: requests.length,
         pendingRequests: requests.filter(r => r.status === 'pending').length,
         completedRequests: requests.filter(r => r.status === 'completed').length,
         totalVolunteers: volunteers.length,
         availableVolunteers: volunteers.filter(v => v.availability === 'available').length,
      });

   } catch (err) {
      console.error('❌ Error fetching stats:', err);
   } finally {
      setLoading(false);
   }
};
   // Fetch on page load
   useEffect(() => {
      fetchStats();
   }, []);

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600 text-lg">Loading Dashboard...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
               🌊 Flood Relief Management System
            </h1>
            <p className="text-gray-600 text-lg">
               Emergency response coordination and resource management
            </p>
         </div>

         {/* Statistics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Help Requests */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-gray-500 text-sm font-medium">Total Help Requests</p>
                     <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalRequests}</p>
                  </div>
                  <div className="text-5xl">📋</div>
               </div>
               <Link
                  to="/help-requests"
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold inline-block"
               >
                  View All →
               </Link>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
                     <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingRequests}</p>
                  </div>
                  <div className="text-5xl">⏳</div>
               </div>
               <Link
                  to="/help-requests"
                  className="mt-4 text-yellow-600 hover:text-yellow-800 text-sm font-semibold inline-block"
               >
                  Manage →
               </Link>
            </div>

            {/* Completed Requests */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-gray-500 text-sm font-medium">Completed Requests</p>
                     <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedRequests}</p>
                  </div>
                  <div className="text-5xl">✅</div>
               </div>
               <p className="mt-4 text-green-600 text-sm font-semibold">
                  {stats.totalRequests > 0 
                     ? `${Math.round((stats.completedRequests / stats.totalRequests) * 100)}% Complete`
                     : '0% Complete'
                  }
               </p>
            </div>

            {/* Total Volunteers */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-gray-500 text-sm font-medium">Total Volunteers</p>
                     <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalVolunteers}</p>
                  </div>
                  <div className="text-5xl">👥</div>
               </div>
               <Link
                  to="/volunteers"
                  className="mt-4 text-purple-600 hover:text-purple-800 text-sm font-semibold inline-block"
               >
                  View All →
               </Link>
            </div>

            {/* Available Volunteers */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-gray-500 text-sm font-medium">Available Volunteers</p>
                     <p className="text-3xl font-bold text-gray-800 mt-2">{stats.availableVolunteers}</p>
                  </div>
                  <div className="text-5xl">✋</div>
               </div>
               <Link
                  to="/volunteers"
                  className="mt-4 text-green-600 hover:text-green-800 text-sm font-semibold inline-block"
               >
                  Assign Tasks →
               </Link>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-gray-500 text-sm font-medium">Emergency Contacts</p>
                     <p className="text-3xl font-bold text-gray-800 mt-2">24/7</p>
                  </div>
                  <div className="text-5xl">📞</div>
               </div>
               <Link
                  to="/emergency-contacts"
                  className="mt-4 text-red-600 hover:text-red-800 text-sm font-semibold inline-block"
               >
                  Quick Access →
               </Link>
            </div>
         </div>

         {/* Quick Actions */}
         <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Link
                  to="/help-requests"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition text-center"
               >
                  📋 Submit Help Request
               </Link>
               <Link
                  to="/volunteers"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition text-center"
               >
                  👥 Register Volunteer
               </Link>
               <Link
                  to="/emergency-contacts"
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition text-center"
               >
                  📞 Emergency Contacts
               </Link>
            </div>
         </div>

         {/* About Section */}
         <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ℹ️ About This System</h2>
            <p className="text-gray-700 leading-relaxed">
               The Flood Relief Management System helps coordinate emergency response during flood situations.
               This platform enables affected individuals to request help, volunteers to register their services,
               and administrators to manage relief operations efficiently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
               <div className="text-center">
                  <div className="text-4xl mb-2">🆘</div>
                  <h3 className="font-semibold text-gray-800">Request Help</h3>
                  <p className="text-sm text-gray-600 mt-1">Submit and track help requests</p>
               </div>
               <div className="text-center">
                  <div className="text-4xl mb-2">🤝</div>
                  <h3 className="font-semibold text-gray-800">Volunteer Support</h3>
                  <p className="text-sm text-gray-600 mt-1">Register and manage volunteers</p>
               </div>
               <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-800">Real-time Tracking</h3>
                  <p className="text-sm text-gray-600 mt-1">Monitor relief operations</p>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Home;