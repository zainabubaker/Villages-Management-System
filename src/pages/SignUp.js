import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

// GraphQL Mutation
const SIGNUP = gql`
  mutation SignUp($fullName: String!, $username: String!, $password: String!) {
    signup(fullName: $fullName, username: $username, password: $password) {
      id
      fullName
      username
    }
  }
`;

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [signUp, { loading }] = useMutation(SIGNUP);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !username || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      const { data } = await signUp({
        variables: { fullName, username, password },
      });

      if (data?.signup) {
        alert('Account created successfully');
        navigate('/login');
      }
    } catch (err) {
      console.error('Sign Up error:', err);
      setError(err.graphQLErrors?.[0]?.message || err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <form
        onSubmit={handleSignUp}
        className="bg-gray-900 p-8 rounded-lg shadow-md text-white"
      >
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        {error && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded">
            {error}
          </div>
        )}
        {loading && <p className="text-blue-500 mb-4">Creating account...</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700"
          required
        />
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
          Sign Up
        </button>
        <p className="mt-4">
          Already have an account?{' '}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
