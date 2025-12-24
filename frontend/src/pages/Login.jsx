import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Login() {
   const [credentials, setCredentials] = useState({
      username: '',
      password: ''
   });
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const { login } = useAuth();
   const navigate = useNavigate();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setCredentials(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
         if (credentials.username === 'admin' && credentials.password === 'admin123') {
            login({ username: 'admin', role: 'admin' });
            navigate('/relief-supplies');
         } else {
            setError('Invalid username or password');
         }
      } catch (err) {
         console.error('Login error:', err);
         setError('Login failed. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center px-4">
         
         <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
            
            
            <div className="text-center mb-6">
               <div className="text-5xl mb-3">🔐</div>
               <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
               <p className="text-gray-600 text-sm mt-1">Access restricted pages</p>
            </div>

            
            {error && (
               <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
                  ❌ {error}
               </div>
            )}

            
            <form onSubmit={handleSubmit} className="space-y-4">
               
               
               <div>
                  <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
                     Username
                  </label>
                  <input
                     type="text"
                     name="username"
                     value={credentials.username}
                     onChange={handleChange}
                     required
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     placeholder="Enter username"
                  />
               </div>

               
               <div>
                  <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
                     Password
                  </label>
                  <input
                     type="password"
                     name="password"
                     value={credentials.password}
                     onChange={handleChange}
                     required
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     placeholder="Enter password"
                  />
               </div>

             
               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:bg-gray-400 text-sm"
               >
                  {loading ? 'Logging in...' : '🔓 Login'}
               </button>
            </form>

           
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
               <p className="text-xs text-gray-600 font-semibold mb-1.5">📝 Demo Credentials:</p>
               <p className="text-xs text-gray-700">Username: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">admin</code></p>
               <p className="text-xs text-gray-700 mt-1">Password: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">admin123</code></p>
            </div>
         </div>
      </div>
   );
}

export default Login;