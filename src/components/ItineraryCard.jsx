import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    Box,
    IconButton,
    Avatar,
    Tooltip,
} from '@mui/material';
import {
    CalendarMonth,
    AttachMoney,
    Favorite,
    FavoriteBorder,
    Bookmark,
    BookmarkBorder,
    Public,
    Lock,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, itinerariesAPI } from '../services/api';

export default function ItineraryCard({ itinerary, onSaveToggle, showCreator = true }) {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isSaved, setIsSaved] = useState(
        user?.savedItineraries?.some(i => i._id === itinerary._id || i === itinerary._id)
    );
    const [isLiked, setIsLiked] = useState(
        itinerary.likes?.includes(user?._id)
    );
    const [likesCount, setLikesCount] = useState(itinerary.likes?.length || 0);
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setSaving(true);
        try {
            const response = await usersAPI.saveItinerary(itinerary._id);
            setIsSaved(response.data.saved);
            if (onSaveToggle) onSaveToggle(itinerary._id, response.data.saved);
        } catch (error) {
            console.error('Error saving itinerary:', error);
        }
        setSaving(false);
    };

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await itinerariesAPI.like(itinerary._id);
            setIsLiked(response.data.liked);
            setLikesCount(response.data.likes);
        } catch (error) {
            console.error('Error liking itinerary:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Flexible';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex', // Added to ensure flex behavior
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: '#1A1A1A', // Explicit Jet Black
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                }
            }}
            component={RouterLink}
            to={`/itineraries/${itinerary._id}`}
            style={{ textDecoration: 'none' }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom sx={{ color: 'secondary.main' }}>
                            {itinerary.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                            {itinerary.destination}
                        </Typography>
                    </Box>
                    <Tooltip title={itinerary.isPublic ? 'Public' : 'Private'}>
                        {itinerary.isPublic ? (
                            <Public fontSize="small" sx={{ opacity: 0.8, color: 'white' }} />
                        ) : (
                            <Lock fontSize="small" sx={{ opacity: 0.8, color: 'white' }} />
                        )}
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<CalendarMonth sx={{ color: 'secondary.main !important' }} />}
                        label={`${itinerary.durationDays} days`}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255, 107, 107, 0.15)',
                            color: 'secondary.main',
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            '& .MuiChip-icon': { color: 'secondary.main' },
                        }}
                    />
                    {itinerary.budget?.amount && (
                        <Chip
                            icon={<AttachMoney sx={{ color: 'white !important' }} />}
                            label={`${itinerary.budget.amount} ${itinerary.budget.currency}`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                '& .MuiChip-icon': { color: 'white' },
                            }}
                        />
                    )}
                </Box>

                {itinerary.startDate && (
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'secondary.main', fontWeight: 500 }}>
                        {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                    </Typography>
                )}

                {showCreator && itinerary.creator && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Avatar
                            src={itinerary.creator.profilePicture}
                            sx={{ width: 24, height: 24, mr: 1 }}
                        >
                            {itinerary.creator.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                            {itinerary.creator.username}
                        </Typography>
                    </Box>
                )}
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleLike} sx={{ color: 'white' }} size="small">
                        {isLiked ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                    <Typography variant="body2" sx={{ color: 'white' }}>{likesCount}</Typography>
                </Box>
                <IconButton onClick={handleSave} disabled={saving} sx={{ color: 'white' }} size="small">
                    {isSaved ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
            </CardActions>
        </Card>
    );
}
