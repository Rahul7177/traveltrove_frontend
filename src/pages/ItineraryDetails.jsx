import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip,
    Paper,
} from '@mui/material';
import {
    CalendarMonth,
    AttachMoney,
    LocationOn,
    Favorite,
    FavoriteBorder,
    Bookmark,
    BookmarkBorder,
    Share,
    ArrowBack,
    AccessTime,
    Note,
} from '@mui/icons-material';
import ReviewList from '../components/ReviewList';
import { useAuth } from '../context/AuthContext';
import { itinerariesAPI, usersAPI } from '../services/api';

export default function ItineraryDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        const fetchItinerary = async () => {
            try {
                const response = await itinerariesAPI.getById(id);
                setItinerary(response.data);
                setIsSaved(user?.savedItineraries?.some(i => i._id === id || i === id));
                setIsLiked(response.data.likes?.includes(user?._id));
                setLikesCount(response.data.likes?.length || 0);
            } catch (err) {
                setError(err.response?.data?.message || 'Itinerary not found');
            }
            setLoading(false);
        };
        fetchItinerary();
    }, [id, user]);

    const handleSave = async () => {
        if (!isAuthenticated) {
            alert('Please login to save itineraries');
            return;
        }
        try {
            const response = await usersAPI.saveItinerary(id);
            setIsSaved(response.data.saved);
        } catch (err) {
            console.error('Error saving itinerary:', err);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            alert('Please login to like itineraries');
            return;
        }
        try {
            const response = await itinerariesAPI.like(id);
            setIsLiked(response.data.liked);
            setLikesCount(response.data.likes);
        } catch (err) {
            console.error('Error liking itinerary:', err);
        }
    };

    const handleReviewAdded = (newReview) => {
        setItinerary(prev => ({
            ...prev,
            reviews: [newReview, ...prev.reviews],
        }));
    };

    const formatDate = (date) => {
        if (!date) return 'Flexible';
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #B96D57 0%, #8C4A36 100%)',
                    color: 'white',
                    py: 6,
                }}
            >
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ color: 'white', mb: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {itinerary.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn />
                            <Typography>{itinerary.destination}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarMonth />
                            <Typography>{itinerary.durationDays} days</Typography>
                        </Box>
                        {itinerary.budget?.amount && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachMoney />
                                <Typography>{itinerary.budget.amount} {itinerary.budget.currency}</Typography>
                            </Box>
                        )}
                    </Box>

                    {itinerary.creator && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                            <Avatar src={itinerary.creator.profilePicture}>
                                {itinerary.creator.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography>Created by {itinerary.creator.username}</Typography>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Action Bar */}
            <Box sx={{ bgcolor: 'background.paper', py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant={isLiked ? 'contained' : 'outlined'}
                            color="error"
                            startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                            onClick={handleLike}
                        >
                            {likesCount} Likes
                        </Button>
                        <Button
                            variant={isSaved ? 'contained' : 'outlined'}
                            startIcon={isSaved ? <Bookmark /> : <BookmarkBorder />}
                            onClick={handleSave}
                        >
                            {isSaved ? 'Saved' : 'Save'}
                        </Button>
                        <Tooltip title="Share">
                            <IconButton onClick={() => navigator.clipboard.writeText(window.location.href)}>
                                <Share />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        {/* Trip Dates */}
                        {itinerary.startDate && (
                            <Paper sx={{ p: 3, mb: 4 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Trip Dates
                                </Typography>
                                <Typography color="text.secondary">
                                    {formatDate(itinerary.startDate)} — {formatDate(itinerary.endDate)}
                                </Typography>
                            </Paper>
                        )}

                        {/* Day-by-Day Itinerary */}
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Day-by-Day Itinerary
                        </Typography>

                        {itinerary.activities?.length > 0 ? (
                            itinerary.activities.map((day, dayIndex) => (
                                <Card key={dayIndex} sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                                            Day {day.day}
                                        </Typography>
                                        <List>
                                            {day.items?.map((item, itemIndex) => (
                                                <ListItem key={itemIndex} divider={itemIndex < day.items.length - 1}>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {item.time && (
                                                                    <Chip
                                                                        icon={<AccessTime />}
                                                                        label={item.time}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                )}
                                                                <Typography fontWeight="medium">
                                                                    {item.activity}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 1 }}>
                                                                {item.location && (
                                                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <LocationOn fontSize="small" /> {item.location}
                                                                    </Typography>
                                                                )}
                                                                {item.notes && (
                                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                                        <Note fontSize="small" /> {item.notes}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Alert severity="info">No activities added yet.</Alert>
                        )}

                        {/* Reviews */}
                        <Divider sx={{ my: 4 }} />
                        <ReviewList
                            reviews={itinerary.reviews || []}
                            targetModel="Itinerary"
                            targetId={id}
                            onReviewAdded={handleReviewAdded}
                        />
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Trip Summary
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemText primary="Destination" secondary={itinerary.destination} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Duration" secondary={`${itinerary.durationDays} days`} />
                                    </ListItem>
                                    {itinerary.budget?.amount && (
                                        <ListItem>
                                            <ListItemText
                                                primary="Budget"
                                                secondary={`${itinerary.budget.amount} ${itinerary.budget.currency}`}
                                            />
                                        </ListItem>
                                    )}
                                    <ListItem>
                                        <ListItemText
                                            primary="Visibility"
                                            secondary={itinerary.isPublic ? 'Public' : 'Private'}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
