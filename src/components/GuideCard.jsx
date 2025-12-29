import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Chip,
    Box,
    IconButton,
    Rating,
    Tooltip,
} from '@mui/material';
import {
    LocationOn,
    Bookmark,
    BookmarkBorder,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

export default function GuideCard({ guide, onSaveToggle }) {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isSaved, setIsSaved] = useState(
        user?.savedGuides?.some(g => g._id === guide._id || g === guide._id)
    );
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
            const response = await usersAPI.saveGuide(guide._id);
            setIsSaved(response.data.saved);
            if (onSaveToggle) onSaveToggle(guide._id, response.data.saved);
        } catch (error) {
            console.error('Error saving guide:', error);
        }
        setSaving(false);
    };

    const getCategoryColor = (category) => {
        const colors = {
            Adventure: 'error',
            Leisure: 'success',
            Cultural: 'warning',
            Nature: 'info',
            Urban: 'secondary',
        };
        return colors[category] || 'default';
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                // Reset torn paper styles for destination cards
                clipPath: 'none',
                filter: 'none',
                borderRadius: 2,
                boxShadow: '1px 1px 3px rgba(0,0,0,0.05), 4px 4px 0px rgba(74, 93, 79, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.1), 6px 6px 0px rgba(74, 93, 79, 0.15)',
                    filter: 'none',
                }
            }}
            component={RouterLink}
            to={`/guides/${guide._id}`}
            style={{ textDecoration: 'none' }}
        >
            <CardMedia
                component="img"
                height="200"
                image={guide.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                alt={guide.title}
                sx={{ objectFit: 'cover' }}
            />

            {/* Category chip */}
            <Chip
                label={guide.category}
                color={getCategoryColor(guide.category)}
                size="small"
                sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    fontWeight: 500,
                }}
            />

            {/* Save button */}
            <Tooltip title={isSaved ? 'Remove from saved' : 'Save guide'}>
                <IconButton
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'white' },
                    }}
                    size="small"
                >
                    {isSaved ? (
                        <Bookmark color="primary" />
                    ) : (
                        <BookmarkBorder />
                    )}
                </IconButton>
            </Tooltip>

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3" noWrap>
                    {guide.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                    <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                        {guide.location?.city}, {guide.location?.country}
                    </Typography>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                    }}
                >
                    {guide.description}
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Rating value={guide.averageRating || 0} precision={0.1} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                    {guide.attractions?.length || 0} attractions
                </Typography>
            </CardActions>
        </Card>
    );
}
