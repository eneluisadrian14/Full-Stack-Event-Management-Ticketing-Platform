import React, { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, Alert, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import AuthCard from '../components/ui/AuthCard';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: credentials,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Email sau parolă incorectă.');
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthCard title="Bine ai revenit" subtitle="Autentifică-te pentru a rezerva bilete la evenimente">
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={credentials.email}
          onChange={handleChange}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Parolă"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={credentials.password}
          onChange={handleChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 44, minHeight: 44 }}
                    aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 1, minHeight: 48 }}>
          Intră în cont
        </Button>
        <Typography variant="body2" align="center" sx={{ mb: 1 }}>
          <Link component={RouterLink} to="/forgot-password" color="primary" fontWeight={600}>
            Am uitat parola
          </Link>
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Nu ai cont?{' '}
          <Link
            component={RouterLink}
            to="/register"
            state={{ email: credentials.email, password: credentials.password }}
            color="primary"
            fontWeight={600}
          >
            Înregistrează-te
          </Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}

export default Login;
