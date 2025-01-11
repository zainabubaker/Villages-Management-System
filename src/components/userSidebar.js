import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";

const GET_USER = gql`
  query GetUser($token: String!) {
    getUser(token: $token) {
      fullName
    }
  }
`;

const Sidebar = () => {
  const token = localStorage.getItem("token");
  const [fullName, setFullName] = useState("User"); // Default fallback to "User"

  const { data, loading, error } = useQuery(GET_USER, {
    variables: { token },
    skip: !token, // Skip query if no token exists
  });

  useEffect(() => {
    if (data?.getUser?.fullName) {
      setFullName(data.getUser.fullName);
    }
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error("Error fetching user data:", error);
    return (
      <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold">Dashboard</div>
        <p className="p-4 text-red-500">Error fetching user data</p>
      </div>
    );
  }

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-xl font-bold">Dashboard</div>
      <nav className="flex-1">
        <ul>
          <li>
            <Link
              to="/user-dashboard"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              to="/UserChat"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Chat
            </Link>
          </li>
          <li>
            <Link
              to="/user-gallery"
              className="block px-4 py-2 hover:bg-gray-700"
            >
              Gallery
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4">
        <p>{fullName}</p> {/* Display full name */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="text-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
