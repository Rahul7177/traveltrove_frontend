import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4A5D4F", // Dark Olive (Headings/Buttons)
      light: "#6B7E70",
      dark: "#2C3630",
      contrastText: "#F9F7F2",
    },
    secondary: {
      main: "#B96D57", // Terracotta (Accent Buttons)
      light: "#D48C79",
      dark: "#8C4A36",
      contrastText: "#F9F7F2",
    },
    background: {
      default: "#e6e1d7", // Slightly darker warm beige
      paper: "#F9F7F2", // Lighter Cream for Cards
    },
    text: {
      primary: "#2C2A24", // Deep Charcoal (almost black)
      secondary: "#5C5A52", // Muted Earth Tone
    },
    success: {
      main: "#10b981", // Vibrant Green
    },
    warning: {
      main: "#f59e0b", // Vibrant Orange
    },
    error: {
      main: "#ef4444", // Vibrant Red
    },
    info: {
      main: "#0ea5e9", // Vibrant Blue
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: "3.5rem",
      color: "#2C2A24", // Dark Charcoal
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: "2.5rem",
      color: "#2C2A24",
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: "2rem",
      color: "#2C2A24",
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: "1.75rem",
      color: "#2C2A24",
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: "1.25rem",
      color: "#2C2A24",
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: "1rem",
      color: "#2C2A24",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
      fontFamily: '"Poppins", sans-serif',
    },
    body1: {
      color: "#2C2A24",
      lineHeight: 1.7,
    },
    body2: {
      color: "#5C5A52",
    },
  },
  shape: {
    borderRadius: 8, // Slightly sharper for that "paper" look, less bubbly
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // More editorial/sharp
          padding: "12px 28px",
          fontWeight: 600,
          letterSpacing: "0.02em",
        },
        contained: {
          backgroundColor: "#4A5D4F", // Olive default
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#3A4B3F",
            boxShadow: "none",
          },
        },
        containedSecondary: {
          backgroundColor: "#B96D57", // Terracotta
          color: "#F9F7F2",
          "&:hover": {
            backgroundColor: "#A05843",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Reset border radius for torn look
          backgroundColor: "#F9F7F2",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
          // Use filter: drop-shadow to shadow the torn shape
          filter:
            "drop-shadow(1px 1px 2px rgba(0,0,0,0.1)) drop-shadow(4px 4px 0px rgba(74, 93, 79, 0.15))",
          boxShadow: "none", // Disable box-shadow
          border: "none",
          transition: "transform 0.3s ease, filter 0.3s ease",
          // Detailed torn paper clip-path
          clipPath: `polygon(
            2% 2%, 5% 1%, 8% 3%, 12% 1%, 15% 3%, 19% 1%, 23% 2%, 27% 1%, 31% 2%, 35% 1%, 39% 3%, 43% 1%, 47% 2%, 49% 0%, 53% 2%, 57% 1%, 61% 3%, 65% 1%, 69% 2%, 73% 1%, 77% 3%, 81% 1%, 85% 2%, 89% 1%, 92% 3%, 95% 1%, 98% 2%, 
            100% 5%, 98% 8%, 99% 11%, 98% 15%, 99% 19%, 98% 23%, 99% 27%, 98% 31%, 99% 35%, 98% 39%, 99% 43%, 98% 47%, 99% 51%, 98% 55%, 99% 59%, 98% 63%, 99% 67%, 98% 71%, 99% 75%, 98% 79%, 99% 83%, 98% 87%, 99% 91%, 98% 95%, 99% 98%,
            97% 100%, 94% 99%, 91% 100%, 88% 99%, 85% 100%, 82% 99%, 79% 100%, 75% 99%, 71% 100%, 67% 99%, 63% 100%, 60% 99%, 57% 100%, 53% 99%, 50% 100%, 47% 99%, 43% 100%, 40% 99%, 37% 100%, 33% 99%, 29% 100%, 25% 99%, 21% 100%, 17% 99%, 13% 100%, 9% 99%, 5% 100%, 2% 99%,
            0% 97%, 1% 94%, 0% 91%, 1% 88%, 0% 85%, 1% 82%, 0% 79%, 1% 76%, 0% 73%, 1% 70%, 0% 67%, 1% 64%, 0% 61%, 1% 58%, 0% 55%, 1% 52%, 0% 49%, 1% 46%, 0% 43%, 1% 40%, 0% 37%, 1% 34%, 0% 31%, 1% 28%, 0% 25%, 1% 22%, 0% 19%, 1% 16%, 0% 13%, 1% 10%, 0% 7%, 1% 4%
          )`,
          "&:hover": {
            transform: "translateY(-4px) rotate(1deg)",
            filter:
              "drop-shadow(2px 2px 4px rgba(0,0,0,0.15)) drop-shadow(6px 6px 0px rgba(74, 93, 79, 0.2))", // Enhanced hover shadow
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 6,
            backgroundColor: "#F9F7F2",
            "& fieldset": {
              borderColor: "#DCD8CC",
            },
            "&:hover fieldset": {
              borderColor: "#4A5D4F",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#4A5D4F",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#F9F7F2",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#e6e1d7", // Match page bg
          color: "#2C2A24",
          boxShadow: "none",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

export default theme;
