import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProtectedRoute({ children }) {
   const { user, isAdmin } = useAuth();

   // If not logged in, redirect to login page
   if (!user) {
      return <Navigate to="/login" replace />;
   }

   // If logged in but not admin, redirect to home
   if (!isAdmin()) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
               <div className="text-6xl mb-4">🚫</div>
               <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
               <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
               <a
                  href="/"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
               >
                  Go to Home
               </a>
            </div>
         </div>
      );
   }

   // If admin, show the page
   return children;
}

export default ProtectedRoute;