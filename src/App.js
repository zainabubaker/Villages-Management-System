import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo-client"; // Apollo Client configuration
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserDashboard from "./pages/UserDashboard";
import AdminVillageManagement from "./pages/AdminVillageManagement";
import Overview from './pages/Overview';
import Sidebar from "./components/Sidebar";
import Gallery from "./pages/Gallery";
import UserSidebar from "./components/userSidebar";
import UserGallery from "./pages/userGallery";
import UserChatPage from './pages/UserChatPage';

import AdminChatPage from './pages/AdminChatPage'
const AppContent = () => {
  const location = useLocation();

  // Determine if the sidebar should be hidden
  const hideSidebar =
    location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/";
  const renderSidebar = () => {
    if (
      location.pathname === "/user-dashboard" ||
      location.pathname === "/user-gallery"   ||
      location.pathname === "/UserChat"
    ) {
      return !hideSidebar && <UserSidebar />; // Render UserSidebar for user-specific routes
    } else {
      return !hideSidebar && <Sidebar />; // Render Sidebar for admin routes
    }
  };

  return (
    <div className="flex">
      {/* Conditionally render the appropriate Sidebar */}
      {renderSidebar()}

      {/* Main content */}
      <div className="flex-1">
        <Routes>
          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Sign Up Page */}
          <Route path="/signup" element={<SignUp />} />

          {/* User Dashboard */}
          <Route path="/user-dashboard" element={<UserDashboard />} />

          {/* Overview */}
          <Route path="/overview" element={<Overview />} />

          {/* Admin Village Management */}
          <Route path="/AdminVillageManagement" element={<AdminVillageManagement />} />
          
          <Route path="/UserChat" element={<UserChatPage />} />
          <Route path="/AdminChat" element={<AdminChatPage />} />
          
          {/* Gallery */}
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/user-gallery" element={<UserGallery />} />

          {/* Default Route (Redirect to Login) */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AppContent />
      </Router>
    </ApolloProvider>
  );
}

export default App;
