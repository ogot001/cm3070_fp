import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import Record from "./components/Record";
import RecordList from "./components/RecordList";
import Login from "./components/Login";
import { collections } from "../../formFields.mjs"; // Import the collections configuration
import "./index.css"; // Import the global CSS styles

// Define a fallback component to display when a route is not found (404 error)
function NotFound() {
  return <h2>404: Page Not Found</h2>;
}

// Determine the name of the first collection from formFields.mjs
const firstCollectionName = collections.length > 0 ? collections[0].name : null;

// Generate dynamic routes for each collection in formFields.mjs
const dynamicRoutes = collections.flatMap(({ name }) => [
  {
    path: `/${name}`, // Base path for the collection
    element: <App />, // Main app component with navigation
    children: [
      {
        path: `/${name}`, // Route for listing records in the collection
        element: <RecordList collectionName={name} />, // Pass the collection name as a prop
      },
      {
        path: `/${name}/create`, // Route for creating a new record in the collection
        element: <Record collectionName={name} />, // Pass the collection name as a prop
      },
      {
        path: `/${name}/edit/:id`, // Route for editing an existing record in the collection
        element: <Record collectionName={name} />, // Pass the collection name as a prop
      },
    ],
  }
]);

// Create the main router configuration
const router = createBrowserRouter([
  {
    path: "/", // Root path of the application
    element: <App />, // Main app component
    children: [
      {
        path: "/", // Default route, typically the home page
        element: firstCollectionName ? <RecordList collectionName={firstCollectionName} /> : <NotFound />,
        // If a collection exists, render its RecordList; otherwise, show a 404 NotFound component
      },
    ],
  },
  ...dynamicRoutes, // Include all dynamically generated routes for collections
  {
    path: "/login", // Route for the login page
    element: <Login onLogin={() => window.location.replace(`/${firstCollectionName}`)} />, 
    // After login, redirect to the first collection
  },
  {
    path: "*", // Catch-all route for undefined paths (handles 404 errors)
    element: <NotFound />, // Render the NotFound component for undefined paths
  },
]);

// Render the React application into the root DOM element
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
