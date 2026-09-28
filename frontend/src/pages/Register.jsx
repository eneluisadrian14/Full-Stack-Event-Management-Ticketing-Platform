import React, { useState, useEffect } from 'react';

import { Box, Typography, TextField, Button, InputAdornment, Alert, Link, CircularProgress } from '@mui/material';

import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import { apiFetch } from '../api/client';

import AuthCard from '../components/ui/AuthCard';



function Register() {

  const navigate = useNavigate();

  const location = useLocation();

  const [pas, setPas] = useState('form');

  const [formData, setFormData] = useState({ username: '', email: '', numar_telefon: '', password: '' });

  const [emailVerificare, setEmailVerificare] = useState('');

  const [emailMascat, setEmailMascat] = useState('');

  const [cod, setCod] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  useEffect(() => {
    const emailDinLogin = location.state?.email;
    const parolaDinLogin = location.state?.password;
    setFormData((prev) => {
      const next = { ...prev };
      if (emailDinLogin && typeof emailDinLogin === 'string') {
        next.email = emailDinLogin;
      }
      if (parolaDinLogin && typeof parolaDinLogin === 'string') {
        next.password = parolaDinLogin;
      }
      return next;
    });
  }, [location.state]);

  const handleChange = (e) => {

    setFormData({ ...formData, [e.target.name]: e.target.value });

  };



  const trimiteCod = async (e) => {

    e.preventDefault();

    setError('');

    setSuccess('');

    setLoading(true);



    try {

      const response = await apiFetch('/api/auth/register', {

        method: 'POST',

        auth: false,

        body: formData,

      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Înregistrarea a eșuat.');



      setEmailVerificare(data.email || formData.email);

      setEmailMascat(data.email_mascat || formData.email);

      setCod('');

      setPas('verify');

      setSuccess(data.message);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };



  const retrimiteCod = async () => {

    setError('');

    setSuccess('');

    setLoading(true);



    try {

      const response = await apiFetch('/api/auth/register/resend', {

        method: 'POST',

        auth: false,

        body: { email: emailVerificare },

      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Retrimiterea codului a eșuat.');

      setSuccess(data.message);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };



  const confirmaCod = async (e) => {

    e.preventDefault();

    setError('');

    setSuccess('');

    setLoading(true);



    try {

      const response = await apiFetch('/api/auth/register/verify', {

        method: 'POST',

        auth: false,

        body: { email: emailVerificare, cod },

      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Verificarea codului a eșuat.');



      setSuccess(data.message);

      setTimeout(() => navigate('/login'), 1500);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };



  if (pas === 'verify') {

    return (

      <AuthCard

        title="Verifică email-ul"

        subtitle={`Introdu codul de 6 cifre trimis la ${emailMascat}`}

      >

        {error && (

          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>

            {error}

          </Alert>

        )}

        {success && (

          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>

            {success}

          </Alert>

        )}

        <Box component="form" onSubmit={confirmaCod} noValidate>

          <TextField

            margin="normal"

            required

            fullWidth

            label="Cod de verificare"

            name="cod"

            value={cod}

            onChange={(e) => setCod(e.target.value.replace(/\D/g, '').slice(0, 6))}

            inputMode="numeric"

            autoComplete="one-time-code"

            placeholder="123456"

            disabled={loading}

            slotProps={{

              htmlInput: { maxLength: 6, style: { letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.25rem' } },

            }}

          />

          <Button

            type="submit"

            fullWidth

            variant="contained"

            size="large"

            disabled={loading || cod.length !== 6}

            sx={{ mt: 3, mb: 1.5, minHeight: 48 }}

          >

            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmă și creează contul'}

          </Button>

          <Button

            type="button"

            fullWidth

            variant="text"

            disabled={loading}

            onClick={retrimiteCod}

            sx={{ mb: 1, textTransform: 'none' }}

          >

            Retrimite codul

          </Button>

          <Button

            type="button"

            fullWidth

            variant="text"

            disabled={loading}

            onClick={() => {

              setPas('form');

              setCod('');

              setError('');

              setSuccess('');

            }}

            sx={{ textTransform: 'none' }}

          >

            Înapoi la formular

          </Button>

        </Box>

      </AuthCard>

    );

  }



  return (

    <AuthCard title="Creează cont" subtitle="Alătură-te ManFast și descoperă evenimente">

      {error && (

        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>

          {error}

        </Alert>

      )}

      {success && (

        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>

          {success}

        </Alert>

      )}

      <Box component="form" onSubmit={trimiteCod} noValidate>

        <TextField
          margin="normal"
          required
          fullWidth
          label="Nume utilizator"
          name="username"
          autoComplete="nickname"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Telefon"
          name="numar_telefon"
          autoComplete="tel"
          value={formData.numar_telefon}
          onChange={handleChange}
          disabled={loading}
        />

        <TextField

          margin="normal"

          required

          fullWidth

          label="Parolă"

          name="password"

          type={showPassword ? 'text' : 'password'}

          autoComplete="new-password"

          value={formData.password}

          onChange={handleChange}

          disabled={loading}

          slotProps={{

            input: {

              endAdornment: (

                <InputAdornment position="end">

                  <Button

                    variant="text"

                    size="small"

                    onClick={() => setShowPassword(!showPassword)}

                    sx={{ minWidth: 44, minHeight: 44 }}

                  >

                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}

                  </Button>

                </InputAdornment>

              ),

            },

          }}

        />

        <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2, minHeight: 48 }}>

          {loading ? <CircularProgress size={24} color="inherit" /> : 'Creează cont'}

        </Button>

        <Typography variant="body2" align="center" color="text.secondary">

          Ai deja cont?{' '}

          <Link component={RouterLink} to="/login" color="primary" fontWeight={600}>

            Autentifică-te

          </Link>

        </Typography>

      </Box>

    </AuthCard>

  );

}



export default Register;

