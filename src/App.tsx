import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Onboarding from './components/Onboarding';
import Home from './components/Home';

const themes = {
  white: createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#ffffff',
        paper: '#ffffff'
      },
      text: {
        primary: '#000000',
        secondary: '#666666',
        disabled: '#cccccc'
      },
      action: {
        active: '#000000',
        hover: '#333333',
        selected: '#000000',
        disabled: '#cccccc'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#000000',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#000000'
          }
        }
      }
    }
  }),
  black: createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#000000',
        paper: '#000000'
      },
      text: {
        primary: '#ffffff',
        secondary: '#cccccc',
        disabled: '#666666'
      },
      action: {
        active: '#ffffff',
        hover: '#cccccc',
        selected: '#ffffff',
        disabled: '#666666'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#ffffff'
          }
        }
      }
    }
  }),
  monospace: createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#59534c',
        paper: '#59534c'
      },
      text: {
        primary: '#ffffff',
        secondary: '#cccccc',
        disabled: '#888888'
      },
      action: {
        active: '#ffffff',
        hover: '#cccccc',
        selected: '#ffffff',
        disabled: '#888888'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#666666'
            }
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#ffffff'
          }
        }
      }
    }
  })
};

function App() {
  const [theme, setTheme] = React.useState<'white' | 'black' | 'monospace'>('white');
  const handleThemeSelect = (newTheme: 'white' | 'black' | 'monospace') => {
    setTheme(newTheme);
    localStorage.setItem('swift-drop-theme', newTheme);
  };
  
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('swift-drop-theme');
    if (savedTheme) {
      setTheme(savedTheme as 'white' | 'black' | 'monospace');
    }
  }, []);

  return (
    <ThemeProvider theme={themes[theme]}>
      <Router>
        <Routes>
           <Route path="/" element={<Onboarding onThemeSelect={handleThemeSelect} />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
