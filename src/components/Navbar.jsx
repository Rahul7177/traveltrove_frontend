import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    InputBase,
    alpha,
    styled,
    useScrollTrigger,
    Slide,
    Container,
    ClickAwayListener,
    keyframes,
} from '@mui/material';
import {
    Search as SearchIcon,
    Explore,
    AccountCircle,
    Dashboard,
    Logout,
    AdminPanelSettings,
    Groups as GroupsIcon,
    Add,
    Map as MapIcon,
    Close,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function HideOnScroll({ children }) {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

// Notch style - Visual extension with slanted sides
const NotchExtension = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '180px',
    height: '10px', // Slightly taller for the slant to be visible
    backgroundColor: theme.palette.primary.main,
    clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)', // Slanted inward sides
    zIndex: 1100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)', // Note: Shadows don't show on clip-path elements directly usually, but standard for now
}));

// Styled Link Button
const NavButton = styled(Button)(({ theme }) => ({
    color: '#FFFFFF',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    gap: '8px',
    minWidth: { xs: '40px', sm: 'auto' },
    padding: { xs: '6px 8px', sm: '6px 16px' },
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '& .button-text': {
        display: { xs: 'none', sm: 'inline' }
    }
}));

// Search Input components
const SearchContainer = styled('div')(({ theme, isOpen }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    borderRadius: 20,
    padding: isOpen ? '4px 12px' : '4px 8px',
    transition: 'all 0.3s ease',
    width: isOpen ? '250px' : 'auto',
    cursor: isOpen ? 'text' : 'pointer',
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
    color: '#FFFFFF',
    width: '100%',
    marginLeft: 8,
    '& .MuiInputBase-input': {
        color: '#FFFFFF',
        '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
            opacity: 1,
        },
    },
}));


export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const toggleSearch = () => {
        setSearchOpen(!searchOpen);
        if (!searchOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    return (
        <HideOnScroll>
            <Box>
                <AppBar
                    position="sticky"
                    color="primary"
                    elevation={0}
                    sx={{
                        borderBottom: 'none',
                        bgcolor: 'primary.main', // Jet Black
                        height: 64, // Standard height
                        justifyContent: 'center',
                        zIndex: 1200,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    }}
                >
                    <Container maxWidth="xl" sx={{ position: 'relative', height: '100%' }}>
                        <Toolbar disableGutters sx={{ minHeight: '64px !important', height: '100%' }}>

                            {/* Left Side Links */}
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: { xs: 0, sm: 0.5 } }}>
                                <NavButton component={RouterLink} to="/search">
                                    <Explore fontSize="small" />
                                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Explore</Box>
                                </NavButton>
                                <NavButton component={RouterLink} to="/groups">
                                    <GroupsIcon fontSize="small" />
                                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Groups</Box>
                                </NavButton>
                                <NavButton component={RouterLink} to="/itineraries">
                                    <MapIcon fontSize="small" />
                                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Itineraries</Box>
                                </NavButton>
                            </Box>

                            {/* Center Logo */}
                            <Box
                                component={RouterLink}
                                to="/"
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column', // Stack vertically
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                    height: '100%',
                                    zIndex: 1210,
                                    gap: 0.5, // Small gap between text and icon
                                }}
                            >
                                <Box
                                    sx={{
                                        background: 'linear-gradient(135deg, #ff5858 0%, #87CEEB 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 0.5,
                                        mt: 1,
                                    }}
                                >
                                    <Explore sx={{
                                        fontSize: { xs: 20, sm: 18 },
                                        color: 'white',
                                    }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{
                                        fontWeight: 800,
                                        mt: 0.75,
                                        letterSpacing: '0.05em',
                                        fontFamily: '"Montserrat", sans-serif',
                                        fontSize: { xs: '0', sm: '1.4rem' },
                                        width: { xs: 0, sm: 'auto' },
                                        overflow: 'hidden',
                                        background: 'linear-gradient(135deg, #ff5858 0%, #87CEEB 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        display: { xs: 'none', sm: 'block' },
                                        lineHeight: 1,
                                    }}
                                >
                                    TravelTrove
                                </Typography>
                            </Box>

                            {/* Right Side Links */}
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: 2 }}>

                                {/* Expandable Search */}
                                <ClickAwayListener onClickAway={() => { if (searchOpen && !searchQuery) setSearchOpen(false); }}>
                                    <Box component="form" onSubmit={handleSearchSubmit}>
                                        <SearchContainer isOpen={searchOpen} onClick={() => !searchOpen && toggleSearch()}>
                                            <IconButton
                                                size="small"
                                                sx={{ color: '#FFFFFF', p: 0.5 }}
                                                onClick={(e) => {
                                                    if (searchOpen) {
                                                        // if open, let input handle
                                                    } else {
                                                        toggleSearch();
                                                    }
                                                }}
                                            >
                                                <SearchIcon fontSize="small" />
                                            </IconButton>

                                            {searchOpen && (
                                                <StyledInput
                                                    inputRef={searchInputRef}
                                                    placeholder="Search..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    endAdornment={
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSearchOpen(false);
                                                                setSearchQuery('');
                                                            }}
                                                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                                                        >
                                                            <Close fontSize="small" />
                                                        </IconButton>
                                                    }
                                                />
                                            )}
                                            {!searchOpen && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{ ml: 1, color: '#FFFFFF', fontWeight: 500, display: { xs: 'none', md: 'block' } }}
                                                >
                                                    Search
                                                </Typography>
                                            )}
                                        </SearchContainer>
                                    </Box>
                                </ClickAwayListener>

                                {/* Create Trip CTA - Reverted */}
                                {isAuthenticated && (
                                    <Button
                                        component={RouterLink}
                                        to="/create-itinerary"
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<Add />}
                                        sx={{
                                            borderRadius: 6,
                                            px: { xs: 2, sm: 3 },
                                            minWidth: { xs: '40px', sm: 'auto' },
                                            boxShadow: 'none',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                                            },
                                            '& .MuiButton-startIcon': {
                                                margin: { xs: 0, sm: '0 8px 0 -4px' }
                                            }
                                        }}
                                    >
                                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Create Trip</Box>
                                    </Button>
                                )}

                                {/* Profile / Auth */}
                                {isAuthenticated ? (
                                    <>
                                        <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1, border: '2px solid rgba(255,255,255,0.2)' }}>
                                            <Avatar
                                                alt={user?.username}
                                                src={user?.profilePicture}
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    bgcolor: 'secondary.main',
                                                    color: '#FFFFFF',
                                                    fontWeight: 'bold',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                            PaperProps={{
                                                sx: { mt: 1.5, borderRadius: 1, overflow: 'hidden' } // "Very slightly" rounded (4px approx)
                                            }}
                                        >
                                            <MenuItem disabled>
                                                <Typography variant="body2" color="text.secondary">
                                                    Signed in as <strong>{user?.username}</strong>
                                                </Typography>
                                            </MenuItem>
                                            <Divider />
                                            <MenuItem component={RouterLink} to="/dashboard" onClick={handleClose}>
                                                <Dashboard sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                                                Dashboard
                                            </MenuItem>
                                            {isAdmin && (
                                                <MenuItem component={RouterLink} to="/admin" onClick={handleClose}>
                                                    <AdminPanelSettings sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                                                    Admin Panel
                                                </MenuItem>
                                            )}
                                            <Divider />
                                            <MenuItem onClick={handleLogout}>
                                                <Logout sx={{ mr: 1, color: 'error.main' }} fontSize="small" />
                                                Logout
                                            </MenuItem>
                                        </Menu>
                                    </>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button component={RouterLink} to="/login" color="inherit" sx={{ color: '#fff' }}>
                                            Login
                                        </Button>
                                        <Button
                                            component={RouterLink}
                                            to="/register"
                                            variant="contained"
                                            color="secondary"
                                            sx={{ borderRadius: 6 }}
                                        >
                                            Sign Up
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Toolbar>

                        {/* The Notch Extension */}
                        <NotchExtension />
                    </Container>
                </AppBar>
            </Box>
        </HideOnScroll>
    );
}
