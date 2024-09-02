import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import { collections } from '../../formFields.mjs'; // Import the collections configuration

const App = () => {
  // State to track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Get the name of the first collection from formFields.mjs
  const firstCollectionName = collections.length > 0 ? collections[0].name : null;

  // useEffect hook to check if the user is authenticated when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve the JWT token from localStorage
    console.log("Token retrieved from localStorage:", token); // Debug log

    if (token) {
      // If a token exists, set the user as authenticated
      setIsAuthenticated(true);
    } else {
      // If no token is found, set the user as not authenticated
      setIsAuthenticated(false);
    }
  }, []);

  // Function to handle login, sets the user as authenticated and navigates to the first collection
  const handleLogin = () => {
    setIsAuthenticated(true);
    console.log("Login successful, navigating to:", firstCollectionName); // Debug log

    if (firstCollectionName) {
      // Navigate to the first collection after successful login
      navigate(`/${firstCollectionName}`);
    }
  };

  return (
    <div className="w-full p-6">
      {isAuthenticated ? (
        <>
          {/* Render the Navbar and the Outlet (which will display the current route's component) if authenticated */}
          <Navbar />
          <Outlet />
        </>
      ) : (
        // Render the Login component if the user is not authenticated
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
