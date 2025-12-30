import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    Paper,
    TextField,
    InputAdornment,
    MenuItem,
    Tooltip,
} from '@mui/material';
import {
    CalendarMonth,
    AttachMoney,
    LocationOn,
    Favorite,
    FavoriteBorder,
    Bookmark,
    BookmarkBorder,
    Public,
    Lock,
    Search,
} from '@mui/icons-material';
import { itinerariesAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ItinerariesList() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent'); // recent, popular, duration

    useEffect(() => {
        fetchItineraries();
    }, []);

    const fetchItineraries = async () => {
        try {
            setLoading(true);
            const response = await itinerariesAPI.getAll();
            // Filter only public itineraries
            const publicItineraries = response.data.filter(it => it.isPublic);
            setItineraries(publicItineraries);
        } catch (err) {
            setError('Failed to load itineraries');
            console.error('Error fetching itineraries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (e, itineraryId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await itinerariesAPI.like(itineraryId);
            setItineraries(prev =>
                prev.map(it =>
                    it._id === itineraryId
                        ? {
                            ...it, likes: response.data.liked
                                ? [...(it.likes || []), user._id]
                                : (it.likes || []).filter(id => id !== user._id)
                        }
                        : it
                )
            );
        } catch (error) {
            console.error('Error liking itinerary:', error);
        }
    };

    const handleSave = async (e, itineraryId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            await usersAPI.saveItinerary(itineraryId);
            // Optionally update local state or refetch
        } catch (error) {
            console.error('Error saving itinerary:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Flexible';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Filter and sort itineraries
    const filteredItineraries = itineraries
        .filter(it =>
            it.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            it.destination?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'popular') {
                return (b.likes?.length || 0) - (a.likes?.length || 0);
            } else if (sortBy === 'duration') {
                return (b.durationDays || 0) - (a.durationDays || 0);
            } else {
                // recent
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Trip Itineraries
                </Typography>
                <Typography color="text.secondary" variant="h6">
                    Explore detailed trip plans created by travelers around the world
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Search and Sort Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search itineraries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1, minWidth: 250 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    label="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="recent">Most Recent</MenuItem>
                    <MenuItem value="popular">Most Popular</MenuItem>
                    <MenuItem value="duration">Duration</MenuItem>
                </TextField>
            </Box>

            {/* Itineraries List */}
            {filteredItineraries.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        {searchQuery ? 'No itineraries found matching your search' : 'No public itineraries available'}
                    </Typography>
                </Paper>
            ) : (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    {filteredItineraries.map((itinerary, index) => (
                        <Box key={itinerary._id}>
                            <ListItem
                                component={RouterLink}
                                to={`/itineraries/${itinerary._id}`}
                                sx={{
                                    py: { xs: 2, sm: 3 },
                                    px: { xs: 1.5, sm: 3 },
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'flex',
                                    gap: { xs: 1, sm: 2 },
                                    flexWrap: 'wrap',
                                }}
                                secondaryAction={
                                    <Box sx={{
                                        display: 'flex',
                                        gap: { xs: 0.5, sm: 1 },
                                        alignItems: 'center',
                                        flexDirection: { xs: 'column', sm: 'row' }
                                    }}>
                                        <Tooltip title="Like">
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => handleLike(e, itinerary._id)}
                                                color="secondary"
                                            >
                                                {itinerary.likes?.includes(user?._id) ? (
                                                    <Favorite />
                                                ) : (
                                                    <FavoriteBorder />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                        <Typography variant="body2" sx={{ minWidth: 20 }}>
                                            {itinerary.likes?.length || 0}
                                        </Typography>
                                        <Tooltip title="Save">
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => handleSave(e, itinerary._id)}
                                                color="secondary"
                                            >
                                                {user?.savedItineraries?.some(
                                                    i => i._id === itinerary._id || i === itinerary._id
                                                ) ? (
                                                    <Bookmark />
                                                ) : (
                                                    <BookmarkBorder />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                }
                            >
                                {/* Avatar/Icon */}
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: 'secondary.light',
                                            width: { xs: 40, sm: 56 },
                                            height: { xs: 40, sm: 56 },
                                        }}
                                    >
                                        <LocationOn sx={{ fontSize: { xs: '20px', sm: '28px' } }} />
                                    </Avatar>
                                </ListItemAvatar>

                                {/* Content */}
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="h6" fontWeight="bold" color="secondary">
                                                {itinerary.title}
                                            </Typography>
                                            <Tooltip title={itinerary.isPublic ? 'Public' : 'Private'}>
                                                {itinerary.isPublic ? (
                                                    <Public fontSize="small" sx={{ opacity: 0.6 }} />
                                                ) : (
                                                    <Lock fontSize="small" sx={{ opacity: 0.6 }} />
                                                )}
                                            </Tooltip>
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 1 }}>
                                            {/* Destination */}
                                            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                                                {itinerary.destination}
                                            </Typography>

                                            {/* Chips */}
                                            <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap', mb: 1 }}>
                                                <Chip
                                                    icon={<CalendarMonth />}
                                                    label={`${itinerary.durationDays} days`}
                                                    size="small"
                                                    color="secondary"
                                                    variant="outlined"
                                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                                                />
                                                {itinerary.budget?.amount && (
                                                    <Chip
                                                        icon={<AttachMoney />}
                                                        label={`${itinerary.budget.amount} ${itinerary.budget.currency}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                                                    />
                                                )}
                                                {itinerary.startDate && (
                                                    <Chip
                                                        label={`${formatDate(itinerary.startDate)} - ${formatDate(itinerary.endDate)}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                            display: { xs: 'none', sm: 'inline-flex' }
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Creator */}
                                            {itinerary.creator && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                    <Avatar
                                                        src={itinerary.creator.profilePicture}
                                                        sx={{ width: 24, height: 24 }}
                                                    >
                                                        {itinerary.creator.username?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" color="text.secondary">
                                                        by {itinerary.creator.username}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < filteredItineraries.length - 1 && <Divider />}
                        </Box>
                    ))}
                </List>
            )}
        </Container>
    );
}
