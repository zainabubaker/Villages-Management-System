import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

// GraphQL Mutation
const LOGIN = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    token
    role
  }
}
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN);
  // Save userId after successful login
   


  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!username || !password) {
      setError("Both fields are required.");
      return;
    }
  
    try {
      const { data } = await login({
        variables: { username, password },
      });
  
      if (data?.login) {
        const { token, role } = data.login;
        localStorage.setItem("token", data.login.token);
        console.log(token);
        localStorage.setItem("role", data.login.role);
      
  
       
  
        // Redirect based on role
        if (role === "admin") {
          navigate("/overview");
        } else {
          navigate("/user-dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-lg shadow-md text-white"
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded">
            {error}
          </div>
        )}
        {loading && <p className="text-blue-500 mb-4">Loading...</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded"
        >
          Login
        </button>
        <p className="mt-4">
          Don't have an account?{' '}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
