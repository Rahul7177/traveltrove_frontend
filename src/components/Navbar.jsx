import { useState } from 'react';
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
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.05),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.black, 0.1),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '30ch',
        },
    },
}));

function HideOnScroll({ children }) {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <HideOnScroll>
            <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Logo */}
                        <Explore sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component={RouterLink}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontWeight: 700,
                                color: 'primary.main',
                                textDecoration: 'none',
                            }}
                        >
                            TravelTrove
                        </Typography>

                        {/* Mobile logo */}
                        <Explore sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'primary.main' }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component={RouterLink}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontWeight: 700,
                                color: 'primary.main',
                                textDecoration: 'none',
                            }}
                        >
                            TravelTrove
                        </Typography>

                        {/* Search bar */}
                        <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search destinations..."
                                    inputProps={{ 'aria-label': 'search' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Search>
                        </Box>

                        {/* Navigation links */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                component={RouterLink}
                                to="/search"
                                color="inherit"
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                                Explore
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/groups"
                                color="inherit"
                                startIcon={<GroupsIcon />}
                                sx={{ display: { xs: 'none', sm: 'flex' } }}
                            >
                                Groups
                            </Button>

                            {isAuthenticated ? (
                                <>
                                    <Button
                                        component={RouterLink}
                                        to="/create-itinerary"
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<Add />}
                                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                                    >
                                        Create Trip
                                    </Button>
                                    <IconButton onClick={handleMenu} color="inherit">
                                        <Avatar
                                            alt={user?.username}
                                            src={user?.profilePicture}
                                            sx={{ width: 32, height: 32 }}
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
                                    >
                                        <MenuItem disabled>
                                            <Typography variant="body2" color="text.secondary">
                                                Signed in as <strong>{user?.username}</strong>
                                            </Typography>
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem
                                            component={RouterLink}
                                            to="/dashboard"
                                            onClick={handleClose}
                                        >
                                            <Dashboard sx={{ mr: 1 }} fontSize="small" />
                                            Dashboard
                                        </MenuItem>
                                        {isAdmin && (
                                            <MenuItem
                                                component={RouterLink}
                                                to="/admin"
                                                onClick={handleClose}
                                            >
                                                <AdminPanelSettings sx={{ mr: 1 }} fontSize="small" />
                                                Admin Panel
                                            </MenuItem>
                                        )}
                                        <Divider />
                                        <MenuItem onClick={handleLogout}>
                                            <Logout sx={{ mr: 1 }} fontSize="small" />
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Button component={RouterLink} to="/login" color="inherit">
                                        Login
                                    </Button>
                                    <Button
                                        component={RouterLink}
                                        to="/register"
                                        variant="contained"
                                        color="primary"
                                    >
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </HideOnScroll>
    );
}
