import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Navbar() {
   const location = useLocation();
   const navigate = useNavigate();
   const { user, logout, isAdmin } = useAuth();

   const isActive = (path) => {
      return location.pathname === path;
   };

   const handleLogout = () => {
      logout();
      navigate('/');
   };

   return (
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
         <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
               {/* Logo */}
               <Link to="/" className="flex items-center space-x-2">
                  <span className="text-3xl">🌊</span>
                  <span className="text-white font-bold text-xl">Flood Relief</span>
               </Link>

               {/* Navigation Links */}
               <div className="hidden md:flex items-center space-x-1">
                  <Link
                     to="/"
                     className={`px-4 py-2 rounded-lg transition ${
                        isActive('/') 
                           ? 'bg-blue-800 text-white' 
                           : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                     }`}
                  >
                     🏠 Home
                  </Link>

                  <Link
                     to="/help-requests"
                     className={`px-4 py-2 rounded-lg transition ${
                        isActive('/help-requests') 
                           ? 'bg-blue-800 text-white' 
                           : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                     }`}
                  >
                     📋 Help Requests
                  </Link>

                  <Link
                     to="/volunteers"
                     className={`px-4 py-2 rounded-lg transition ${
                        isActive('/volunteers') 
                           ? 'bg-blue-800 text-white' 
                           : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                     }`}
                  >
                     🙋 Volunteers
                  </Link>

                  <Link
                     to="/emergency-contacts"
                     className={`px-4 py-2 rounded-lg transition ${
                        isActive('/emergency-contacts') 
                           ? 'bg-blue-800 text-white' 
                           : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                     }`}
                  >
                     📞 Emergency
                  </Link>

                  {/* Admin Only Links */}
                  {isAdmin() && (
                     <>
                        <Link
                           to="/rescue-operations"
                           className={`px-4 py-2 rounded-lg transition ${
                              isActive('/rescue-operations') 
                                 ? 'bg-blue-800 text-white' 
                                 : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                           }`}
                        >
                           🚁 Rescue Ops
                        </Link>

                        <Link
                           to="/relief-supplies"
                           className={`px-4 py-2 rounded-lg transition ${
                              isActive('/relief-supplies') 
                                 ? 'bg-blue-800 text-white' 
                                 : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                           }`}
                        >
                           📦 Supplies
                        </Link>
                     </>
                  )}

                  {/* Login/Logout Button */}
                  {user ? (
                     <div className="flex items-center space-x-2 ml-4">
                        <span className="text-white text-sm">
                           👤 {user.username}
                        </span>
                        <button
                           onClick={handleLogout}
                           className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                        >
                           🚪 Logout
                        </button>
                     </div>
                  ) : (
                     <Link
                        to="/login"
                        className="ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                     >
                        🔐 Admin Login
                     </Link>
                  )}
               </div>
            </div>
         </div>
      </nav>
   );
}

export default Navbar;