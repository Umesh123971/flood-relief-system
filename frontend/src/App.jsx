/*
Router → Enables routing & URL tracking(Controll whole app's navigation)

Routes → Groups all Route and finds the match

Route → Maps a URL path to a component

AuthProvider is a Context Provider that manages authentication (login state) for the whole app.
*/ 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // ✅ Import AuthProvider
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import HelpRequests from './pages/HelpRequests';
import Volunteers from './pages/Volunteers';
import EmergencyContacts from './pages/EmergencyContacts';
import RescueOperations from './pages/RescueOperations';
import ReliefSupplies from './pages/ReliefSupplies';
import Login from './pages/Login';




function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/help-requests" element={<HelpRequests />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/login" element={<Login />} />
  
          

          {/* Admin only*/ }
          <Route path="/rescue-operations" 
          element={
            <ProtectedRoute>
              <RescueOperations />
            </ProtectedRoute>
          }
          />

          <Route path="/relief-supplies"
                 element={
                  <ProtectedRoute>
                    <ReliefSupplies />
                  </ProtectedRoute>
                  
                 }
          />
      
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;