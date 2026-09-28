import React from 'react';
import { Box, Container, Typography, Link, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { tokens } from '../../theme/tokens';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: { xs: 3, md: 4 },
        borderTop: `1px solid ${tokens.border}`,
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            ManFast — bilete nominale pentru evenimente
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link component={RouterLink} to="/" color="text.secondary" underline="hover" variant="body2">
              Evenimente
            </Link>
            <Link component={RouterLink} to="/login" color="text.secondary" underline="hover" variant="body2">
              Autentificare
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
