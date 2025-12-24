import { createContext,  useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   // Check if user is already logged in (from localStorage)
  useEffect(() => {
  const loadUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  };

  loadUser();
}, []);


   // Login function
   const login = (userData) => {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
   };

   // Logout function
   const logout = () => {
      setUser(null);
      localStorage.removeItem('user');
   };

   // Check if user is admin
   const isAdmin = () => {
      return user?.role === 'admin';
   };

   const value = {
      user,
      login,
      logout,
      isAdmin,
      loading
   };

   return (
      <AuthContext.Provider value={value}>
         {!loading && children}
      </AuthContext.Provider>
   );
}

export { AuthContext };