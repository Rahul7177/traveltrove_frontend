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
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #B96D57 0%, #8C4A36 100%)',
                color: 'white',
            }}
            component={RouterLink}
            to={`/itineraries/${itinerary._id}`}
            style={{ textDecoration: 'none' }}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom sx={{ color: 'inherit' }}>
                            {itinerary.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, color: 'inherit' }}>
                            {itinerary.destination}
                        </Typography>
                    </Box>
                    <Tooltip title={itinerary.isPublic ? 'Public' : 'Private'}>
                        {itinerary.isPublic ? (
                            <Public fontSize="small" sx={{ opacity: 0.8 }} />
                        ) : (
                            <Lock fontSize="small" sx={{ opacity: 0.8 }} />
                        )}
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<CalendarMonth sx={{ color: 'white' }} />}
                        label={`${itinerary.durationDays} days`}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '& .MuiChip-icon': { color: 'white' },
                        }}
                    />
                    {itinerary.budget?.amount && (
                        <Chip
                            icon={<AttachMoney sx={{ color: 'inherit !important' }} />}
                            label={`${itinerary.budget.amount} ${itinerary.budget.currency}`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                '& .MuiChip-icon': { color: 'white' },
                            }}
                        />
                    )}
                </Box>

                {itinerary.startDate && (
                    <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                        {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                    </Typography>
                )}

                {showCreator && itinerary.creator && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
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
