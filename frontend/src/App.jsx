import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// ✅ ADD THESE MISSING IMPORTS
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import HelpRequests from './pages/HelpRequests';
import Volunteers from './pages/Volunteers';
import EmergencyContacts from './pages/EmergencyContacts';
import RescueOperations from './pages/RescueOperations';
import ReliefSupplies from './pages/ReliefSupplies';
import Login from './pages/Login';

function DebugRouter() {
  const location = useLocation();
  console.log('📍 Current route:', location.pathname);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <DebugRouter />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/help-requests" element={<HelpRequests />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/rescue-operations"
              element={
                <ProtectedRoute>
                  <RescueOperations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relief-supplies"
              element={
                <ProtectedRoute>
                  <ReliefSupplies />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;