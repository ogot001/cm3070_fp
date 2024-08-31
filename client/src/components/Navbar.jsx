import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token from localStorage
    navigate("/login"); // Redirect the user to the login page
  };

  return (
    <div>
      <nav className="flex justify-between items-center mb-6">
        <NavLink to="/employees">
          <img
            alt="MongoDB logo"
            className="h-10 inline"
            src="https://raw.githubusercontent.com/mongodb-developer/mern-stack-example/603144e25ba5549159d1962601337652a7bfa253/mern/client/src/assets/mongodb.svg"
          />
        </NavLink>
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-600 bg-red-600 text-white hover:bg-red-700 h-9 rounded-md px-3 cursor-pointer ml-4"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
