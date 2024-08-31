import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import { collections } from '../../formFields.mjs'; // Adjust path as needed

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const firstCollectionName = collections.length > 0 ? collections[0].name : null;

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token retrieved from localStorage:", token); // Debug log
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    console.log("Login successful, navigating to:", firstCollectionName); // Debug log
    if (firstCollectionName) {
      navigate(`/${firstCollectionName}`);
    }
  };

  return (
    <div className="w-full p-6">
      {isAuthenticated ? (
        <>
          <Navbar />
          <Outlet />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
