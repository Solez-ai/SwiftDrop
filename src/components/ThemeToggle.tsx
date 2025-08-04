import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';
import { useThemeContext } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { themeMode, toggleThemeMode } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleThemeMode}
        color="inherit"
        aria-label="toggle theme"
        size="large"
      >
        {themeMode === 'dark' ? <LightIcon /> : <DarkIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
