import React from 'react';
import { Box, Typography, Paper, Link, Container } from '@mui/material';
import { GitHub, Code, Public } from '@mui/icons-material';

const About: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          About SwiftDrop
        </Typography>
        
        <Typography variant="body1" paragraph>
          SwiftDrop is a fast and secure file sharing application that allows you to transfer files 
          between devices using WiFi Direct technology. No internet connection is required - just connect 
          directly to nearby devices and share files instantly.
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Features
          </Typography>
          <ul>
            <li>Fast file transfers using WiFi Direct</li>
            <li>No internet connection required</li>
            <li>Secure peer-to-peer transfers</li>
            <li>Support for all file types</li>
            <li>Dark/Light theme support</li>
            <li>User-friendly interface</li>
          </ul>
        </Box>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            How It Works
          </Typography>
          <ol>
            <li>Open SwiftDrop on both devices</li>
            <li>Ensure WiFi is enabled on both devices</li>
            <li>Select files to send on one device</li>
            <li>Choose the receiving device from the list</li>
            <li>Accept the transfer on the receiving device</li>
            <li>Wait for the transfer to complete</li>
          </ol>
        </Box>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Open Source
          </Typography>
          <Typography paragraph>
            SwiftDrop is an open-source project. You can contribute to its development on GitHub.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Link 
              href="https://github.com/yourusername/swiftdrop" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <GitHub /> View on GitHub
            </Link>
            <Link 
              href="https://yourwebsite.com" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Public /> Visit Website
            </Link>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Version 1.0.0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SwiftDrop. All rights reserved.
          </Typography>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Built with
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Code sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography>React</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Code sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography>TypeScript</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Code sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography>Material-UI</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Code sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography>Capacitor</Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
