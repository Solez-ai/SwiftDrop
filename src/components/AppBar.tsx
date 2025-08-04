import React from 'react';
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import ConnectionStatus from './ConnectionStatus';

interface AppBarProps {
  handleDrawerToggle: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ handleDrawerToggle }) => {
  const theme = useTheme();
  const { isMobile } = useThemeContext();

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${theme.mixins.drawerWidth}px)` },
        ml: { sm: `${theme.mixins.drawerWidth}px` },
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          SwiftDrop
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ConnectionStatus />
          {!isMobile && <ThemeToggle />}
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
