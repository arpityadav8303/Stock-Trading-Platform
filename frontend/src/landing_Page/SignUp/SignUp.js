import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../NavBar';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3002/signup', {
        email,
        password,
      });

      if (response.status === 200) {
        // Redirect to dashboard
        window.location.href = 'http://localhost:3001;'
      } else {
        alert('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong');
    }
  };

  return (
    <>
      <NavBar />
      <div style={{
        padding: '2rem',
        maxWidth: '400px',
        margin: '3rem auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#333',
          fontFamily: 'Segoe UI, sans-serif'
        }}>SignUp</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
          <button type="submit" style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}>
            Sign Up
          </button>
        </form>
      </div>
    </>
  );
}

export default SignUp;