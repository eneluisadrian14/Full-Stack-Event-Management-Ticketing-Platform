import React from 'react';
import { Container } from '@mui/material';

function PageContainer({ children, maxWidth = 'lg', sx = {} }) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 3 },
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}

export default PageContainer;
