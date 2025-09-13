import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to log in. Please check your password.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
      <div style={{ maxWidth: '320px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h1 style={{ textAlign: 'center' }}>Genesis Presentations</h1>
        <h2 style={{ textAlign: 'center', fontWeight: 'normal', color: '#666' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
