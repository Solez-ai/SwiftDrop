import React, { ReactNode } from 'react';
import { Box, CssBaseline, useTheme } from '@mui/material';
import { useThemeContext } from '../contexts/ThemeContext';
import AppBar from './AppBar';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { isMobile } = useThemeContext();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar handleDrawerToggle={handleDrawerToggle} />
      
      {/* Sidebar for desktop */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${theme.mixins.drawerWidth}px)` },
          marginTop: theme.mixins.toolbar.minHeight,
          pb: theme.spacing(10), // Add padding for bottom navigation
        }}
      >
        {children}
      </Box>
      
      {/* Bottom navigation for mobile */}
      {isMobile && <BottomNavigation />}
    </Box>
  );
};

export default Layout;
