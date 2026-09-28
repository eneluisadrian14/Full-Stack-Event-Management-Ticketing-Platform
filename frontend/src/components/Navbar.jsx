import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { AuthContext } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Evenimente' },
  { to: '/my-tickets', label: 'Biletele mele', auth: true },
  { to: '/profile', label: 'Profil', auth: true },
];

function Navbar() {
  const theme = useTheme();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMenuRef = useRef(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const timer = setTimeout(() => closeMenuRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [mobileOpen]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkSx = (path) => ({
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: isActive(path) ? 'primary.main' : 'text.primary',
    minHeight: 44,
    borderBottom: isActive(path) ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
    borderRadius: 0,
    px: 1.5,
    '&:hover': {
      color: 'primary.main',
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    },
  });

  const drawer = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
          <EventRoundedIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>ManFast</Typography>
        </Box>
        <IconButton
          ref={closeMenuRef}
          onClick={() => setMobileOpen(false)}
          aria-label="Închide meniu"
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <List sx={{ flex: 1, px: 1 }}>
        {navLinks
          .filter((l) => !l.auth || user)
          .map((link) => (
            <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                selected={isActive(link.to)}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: 'primary.main',
                  },
                }}
              >
                <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              </ListItemButton>
            </ListItem>
          ))}
        {isAdmin && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to="/admin"
              onClick={() => setMobileOpen(false)}
              selected={isActive('/admin')}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <ListItemText
                primary="Panou Admin"
                slotProps={{ primary: { sx: { fontWeight: 700, color: 'primary.main' } } }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {!user ? (
          <Stack gap={1}>
            <Button component={RouterLink} to="/login" fullWidth variant="outlined" onClick={() => setMobileOpen(false)} sx={{ minHeight: 44 }}>
              Autentificare
            </Button>
            <Button component={RouterLink} to="/register" fullWidth variant="contained" onClick={() => setMobileOpen(false)} sx={{ minHeight: 44 }}>
              Înregistrare
            </Button>
          </Stack>
        ) : (
          <Stack gap={1}>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, px: 1 }}>
              Salut, {user.username}
            </Typography>
            <Button fullWidth variant="outlined" color="error" onClick={() => { logout(); setMobileOpen(false); }} sx={{ minHeight: 44 }}>
              Ieșire
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 72 }, px: { xs: 2, md: 3 } }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', minWidth: 140 }}
          >
            <EventRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, display: { xs: 'none', sm: 'block' } }}>
              ManFast
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {navLinks
              .filter((l) => !l.auth || user)
              .map((link) => (
                <Button key={link.to} component={RouterLink} to={link.to} sx={linkSx(link.to)}>
                  {link.label}
                </Button>
              ))}
            {isAdmin && (
              <Button
                component={RouterLink}
                to="/admin"
                startIcon={<AdminPanelSettingsRoundedIcon />}
                variant={isActive('/admin') ? 'contained' : 'outlined'}
                color="primary"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  ml: 1,
                  minHeight: 40,
                  boxShadow: isActive('/admin') ? `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                }}
              >
                Admin
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, minWidth: 140, justifyContent: 'flex-end' }}>
            {!user ? (
              <>
                <Button component={RouterLink} to="/login" variant="text" sx={{ textTransform: 'none', minHeight: 44 }}>
                  Login
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" sx={{ minHeight: 44 }}>
                  Înregistrare
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mr: 0.5 }}>
                  {user.username}
                </Typography>
                <Button variant="outlined" color="error" size="small" onClick={logout} sx={{ minHeight: 40 }}>
                  Ieșire
                </Button>
              </>
            )}
          </Box>

          <IconButton
            sx={{ display: { md: 'none' }, minWidth: 44, minHeight: 44 }}
            onClick={(e) => {
              e.currentTarget.blur();
              setMobileOpen(true);
            }}
            aria-label="Deschide meniu"
            aria-expanded={mobileOpen}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: 'none' } }}
        slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
