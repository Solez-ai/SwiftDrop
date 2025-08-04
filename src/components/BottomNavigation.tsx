import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home as HomeIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledBottomNavigation = styled(MuiBottomNavigation)(({ theme }) => ({
  width: '100%',
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Paper elevation={3}>
      <StyledBottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
      >
        <BottomNavigationAction 
          label="Home" 
          value="/" 
          icon={<HomeIcon />} 
        />
        <BottomNavigationAction 
          label="Transfer" 
          value="/transfer" 
          icon={<SendIcon />} 
        />
        <BottomNavigationAction 
          label="Settings" 
          value="/settings" 
          icon={<SettingsIcon />} 
        />
        <BottomNavigationAction 
          label="About" 
          value="/about" 
          icon={<InfoIcon />} 
        />
      </StyledBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;
