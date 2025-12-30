import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1A1A1A", // Jet Black
      light: "#333333",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#ff5858ff", // Light Coral Pink (Vibrant)
      light: "#FF9E99",
      dark: "#C63939",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#dcdce0ff", // Ghost White
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A", // Jet Black
      secondary: "#4A4A4A", // Dark Grey
    },
    success: {
      main: "#90EE90", // Light Green
      contrastText: "#1A1A1A",
    },
    warning: {
      main: "#ff7700ff", // Lime Yellow (Vibrant)
      contrastText: "#1A1A1A",
    },
    info: {
      main: "#87CEEB", // Sky Blue
      contrastText: "#1A1A1A",
    },
    error: {
      main: "#FF69B4", // Pink (Using as error/vibrant tag)
      contrastText: "#FFFFFF",
    },
    action: {
      active: "#20B2AA", // Light Sea Blue for icons/links
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 800,
      fontSize: "3.5rem",
      color: "#1A1A1A",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: "2.5rem",
      color: "#1A1A1A",
    },
    h3: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: "2rem",
      color: "#1A1A1A",
    },
    h4: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: "1.75rem",
      color: "#1A1A1A",
    },
    h5: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: "1.25rem",
      color: "#1A1A1A",
    },
    h6: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: "1rem",
      color: "#1A1A1A",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontFamily: '"Poppins", sans-serif',
    },
    body1: {
      color: "#1A1A1A",
      lineHeight: 1.7,
    },
    body2: {
      color: "#4A4A4A",
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          fontWeight: 600,
          letterSpacing: "0.02em",
        },
        containedPrimary: {
          backgroundColor: "#1A1A1A",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
        containedSecondary: {
          backgroundColor: "#FF6B6B", // Light Coral Pink (Vibrant)
          color: "#FFFFFF",
          boxShadow: "0 4px 6px rgba(255, 107, 107, 0.25)",
          "&:hover": {
            backgroundColor: "#FF5252", // Slightly darker Coral
            boxShadow: "0 6px 10px rgba(255, 107, 107, 0.3)",
          },
        },
        text: {
          color: "#20B2AA", // Light Sea Blue
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1A",
          color: "#FFFFFF",
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
