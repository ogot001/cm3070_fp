import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import Record from "./components/Record";
import RecordList from "./components/RecordList";
import { collections } from "../../formFields.mjs"; // Adjust the path based on your file structure
import "./index.css";

// Define a fallback error element
function NotFound() {
  return <h2>404: Page Not Found</h2>;
}

// Generate dynamic routes based on the collections
const dynamicRoutes = collections.flatMap(({ name }) => [
  {
    path: `/${name}`,
    element: <App />,
    children: [
      {
        path: `/${name}`,
        element: <RecordList collectionName={name} />, // Pass collection name as prop
      },
      {
        path: `/${name}/create`,
        element: <Record collectionName={name} />, // Pass collection name as prop
      },
      {
        path: `/${name}/edit/:id`,
        element: <Record collectionName={name} />, // Pass collection name as prop
      },
    ],
  }
]);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <RecordList collectionName="record" />, // Default route to a specific collection
      },
    ],
  },
  ...dynamicRoutes,
  {
    path: "*",
    element: <NotFound />, // Handle 404 errors
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
