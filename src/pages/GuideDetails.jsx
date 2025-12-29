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
    Tabs,
    Tab,
    Card,
    CardContent,
    CardMedia,
    Rating,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    LocationOn,
    Bookmark,
    BookmarkBorder,
    Share,
    Hotel,
    Restaurant,
    DirectionsRun,
    History,
    Palette,
    PhotoLibrary,
    ArrowBack,
    Groups,
    Star,
    Language,
    WbSunny,
    AttachMoney,
    AccessTime,
    ChevronLeft,
    ChevronRight,
    Close,
} from '@mui/icons-material';
import ReviewList from '../components/ReviewList';
import { useAuth } from '../context/AuthContext';
import { guidesAPI, usersAPI, groupsAPI } from '../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

// Quick facts based on destination
const getQuickFacts = (guide) => {
    const facts = [
        { icon: <LocationOn />, label: 'Location', value: `${guide.location?.city}, ${guide.location?.country}` },
        { icon: <Palette />, label: 'Category', value: guide.category },
        { icon: <PhotoLibrary />, label: 'Attractions', value: `${guide.attractions?.length || 0} places to visit` },
    ];

    // Add interesting facts if available
    if (guide.interestingFacts?.length > 0) {
        guide.interestingFacts.slice(0, 3).forEach((fact, i) => {
            facts.push({ icon: <Star color="warning" />, label: `Fun Fact ${i + 1}`, value: fact });
        });
    } else {
        // Default interesting facts based on category
        const defaultFacts = {
            Adventure: [
                'Best time to visit: Spring and Fall',
                'Average trip duration: 5-7 days',
                'Popular for outdoor activities',
            ],
            Cultural: [
                'Rich in historical landmarks',
                'Known for local festivals',
                'Traditional cuisine must-try',
            ],
            Nature: [
                'Best for wildlife watching',
                'Eco-friendly travel recommended',
                'Stunning natural landscapes',
            ],
            Urban: [
                'Vibrant nightlife scene',
                'World-class museums and galleries',
                'Excellent public transportation',
            ],
            Leisure: [
                'Perfect for relaxation',
                'Luxury resorts available',
                'Spa and wellness options',
            ],
        };
        const categoryFacts = defaultFacts[guide.category] || defaultFacts.Adventure;
        categoryFacts.forEach((fact, i) => {
            facts.push({ icon: <Star color="warning" />, label: `Tip ${i + 1}`, value: fact });
        });
    }

    return facts;
};

export default function GuideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [myGroups, setMyGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [shareSuccess, setShareSuccess] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Combine all images for the slideshow
    const allImages = guide ? [
        ...(guide.images || []),
        ...(guide.attractions?.map(a => a.image).filter(Boolean) || [])
    ].filter(Boolean) : [];

    // If no images found, use default
    if (guide && allImages.length === 0) {
        allImages.push('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200');
    }

    // Auto-advance slideshow
    useEffect(() => {
        if (allImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % allImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [allImages.length]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await guidesAPI.getById(id);
                setGuide(response.data);
                setIsSaved(user?.savedGuides?.some(g => g._id === id || g === id));

                // Fetch user's groups
                if (isAuthenticated) {
                    try {
                        const groupsRes = await groupsAPI.getMy();
                        setMyGroups(groupsRes.data);
                    } catch (e) {
                        // Ignore group fetch errors
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Guide not found');
            }
            setLoading(false);
        };
        fetchData();
    }, [id, user, isAuthenticated]);

    const handleSave = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            const response = await usersAPI.saveGuide(id);
            setIsSaved(response.data.saved);
        } catch (err) {
            console.error('Error saving guide:', err);
        }
    };

    const handleShareToGroup = async () => {
        if (!selectedGroup) return;

        try {
            await groupsAPI.createPost(selectedGroup, {
                content: `🌍 Check out this destination: **${guide.title}** in ${guide.location?.city}, ${guide.location?.country}!\n\n${guide.description?.slice(0, 150)}...\n\n🔗 View more: ${window.location.href}`
            });
            setShareSuccess('Shared to group successfully!');
            setTimeout(() => {
                setShowShareDialog(false);
                setShareSuccess('');
                setSelectedGroup('');
            }, 1500);
        } catch (err) {
            setError('Failed to share to group');
        }
    };

    const handleReviewAdded = (newReview) => {
        setGuide(prev => ({
            ...prev,
            reviews: [newReview, ...prev.reviews],
        }));
    };

    const handleReviewUpdated = (updatedReview) => {
        setGuide(prev => ({
            ...prev,
            reviews: prev.reviews.map(r => r._id === updatedReview._id ? updatedReview : r),
        }));
    };

    const handleReviewDeleted = (reviewId) => {
        setGuide(prev => ({
            ...prev,
            reviews: prev.reviews.filter(r => r._id !== reviewId),
        }));
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

    const quickFacts = getQuickFacts(guide);

    return (
        <Box>
            {/* Hero Image / Carousel */}
            <Box
                sx={{
                    height: 400,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    color: 'white',
                    overflow: 'hidden',
                }}
            >
                {/* Carousel Background Images */}
                {allImages.map((img, index) => (
                    <Box
                        key={index}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: index === currentImageIndex ? 1 : 0,
                            transition: 'opacity 1s ease-in-out',
                            zIndex: 0,
                        }}
                    />
                ))}

                {/* Carousel Controls */}
                {allImages.length > 1 && (
                    <>
                        <IconButton
                            onClick={() => setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                            sx={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.3)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                                zIndex: 2,
                            }}
                        >
                            <ChevronLeft fontSize="large" />
                        </IconButton>
                        <IconButton
                            onClick={() => setCurrentImageIndex(prev => (prev + 1) % allImages.length)}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.3)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                                zIndex: 2,
                            }}
                        >
                            <ChevronRight fontSize="large" />
                        </IconButton>
                    </>
                )}

                <Container maxWidth="lg" sx={{ pb: 4, width: '100%', position: 'relative', zIndex: 1 }}>
                    <Box
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.35)', // More translucent
                            backdropFilter: 'blur(12px)', // Increased blur for readability
                            borderRadius: 3, // Slightly less rounded
                            p: 2, // More compact padding
                            width: 'fit-content', // Don't span full width
                            maxWidth: '100%',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                        }}
                    >
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(-1)}
                            sx={{ mb: 2, pl: 0, color: 'text.primary' }}
                        >
                            Back
                        </Button>
                        <Box sx={{ mb: 2 }}>
                            <Chip label={guide.category} color="primary" />
                        </Box>

                        <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
                            {guide.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn sx={{ mr: 0.5 }} />
                                <Typography fontWeight="medium">
                                    {guide.location?.city}, {guide.location?.country}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating value={guide.averageRating || 0} precision={0.1} readOnly size="small" />
                                <Typography sx={{ ml: 1 }}>({guide.reviews?.length || 0} reviews)</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Action Bar */}
            <Box sx={{ bgcolor: 'background.paper', py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant={isSaved ? 'contained' : 'outlined'}
                            startIcon={isSaved ? <Bookmark /> : <BookmarkBorder />}
                            onClick={handleSave}
                        >
                            {isSaved ? 'Saved' : 'Save Guide'}
                        </Button>
                        <Tooltip title="Copy link">
                            <IconButton onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied!');
                            }}>
                                <Share />
                            </IconButton>
                        </Tooltip>
                        {isAuthenticated && myGroups.length > 0 && (
                            <Button
                                variant="outlined"
                                startIcon={<Groups />}
                                onClick={() => setShowShareDialog(true)}
                            >
                                Share to Group
                            </Button>
                        )}
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        {/* Description */}
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                            {guide.description}
                        </Typography>

                        {/* Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
                            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                <Tab icon={<History />} label="History & Culture" />
                                <Tab icon={<PhotoLibrary />} label="Attractions" />
                                <Tab icon={<Hotel />} label="Recommendations" />
                            </Tabs>
                        </Box>

                        {/* History & Culture */}
                        <TabPanel value={tabValue} index={0}>
                            {guide.history && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        History
                                    </Typography>
                                    <Typography color="text.secondary" paragraph>
                                        {guide.history}
                                    </Typography>
                                </Box>
                            )}
                            {guide.culture && (
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        Culture
                                    </Typography>
                                    <Typography color="text.secondary" paragraph>
                                        {guide.culture}
                                    </Typography>
                                </Box>
                            )}
                        </TabPanel>

                        {/* Attractions */}
                        <TabPanel value={tabValue} index={1}>
                            <Grid container spacing={3}>
                                {guide.attractions?.map((attraction, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Card>
                                            {attraction.image && (
                                                <CardMedia
                                                    component="img"
                                                    height="180"
                                                    image={attraction.image}
                                                    alt={attraction.name}
                                                />
                                            )}
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {attraction.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {attraction.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </TabPanel>

                        {/* Recommendations */}
                        <TabPanel value={tabValue} index={2}>
                            {/* Lodging */}
                            {guide.recommendations?.lodging?.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Hotel color="primary" /> Lodging
                                    </Typography>
                                    <List>
                                        {guide.recommendations.lodging.map((item, i) => (
                                            <ListItem key={i} divider>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`${item.lodgingType || item.type} - ${item.description}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {/* Dining */}
                            {guide.recommendations?.dining?.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Restaurant color="secondary" /> Dining
                                    </Typography>
                                    <List>
                                        {guide.recommendations.dining.map((item, i) => (
                                            <ListItem key={i} divider>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`${item.cuisine} - ${item.description}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            {/* Activities */}
                            {guide.recommendations?.activities?.length > 0 && (
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DirectionsRun color="success" /> Activities
                                    </Typography>
                                    <List>
                                        {guide.recommendations.activities.map((item, i) => (
                                            <ListItem key={i} divider>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`${item.activityType || item.type} - ${item.description}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </TabPanel>

                        {/* Reviews Section */}
                        <Divider sx={{ my: 4 }} />
                        <ReviewList
                            reviews={guide.reviews || []}
                            targetModel="Guide"
                            targetId={id}
                            onReviewAdded={handleReviewAdded}
                            onReviewUpdated={handleReviewUpdated}
                            onReviewDeleted={handleReviewDeleted}
                        />
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Image Gallery */}
                        {guide.images?.length > 1 && (
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Photo Gallery
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {guide.images.slice(0, 4).map((img, i) => (
                                            <Grid item xs={6} key={i}>
                                                <Box
                                                    component="img"
                                                    src={img}
                                                    alt={`${guide.title} ${i + 1}`}
                                                    onClick={() => {
                                                        setLightboxIndex(i);
                                                        setLightboxOpen(true);
                                                    }}
                                                    sx={{
                                                        width: '100%',
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.9 }
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Facts with Interesting Facts */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Quick Facts & Tips
                                </Typography>
                                <List dense>
                                    {quickFacts.map((fact, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>{fact.icon}</ListItemIcon>
                                            <ListItemText
                                                primary={fact.label}
                                                secondary={fact.value}
                                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Share to Group Dialog */}
            <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Share to Group</DialogTitle>
                <DialogContent>
                    {shareSuccess ? (
                        <Alert severity="success" sx={{ mt: 2 }}>{shareSuccess}</Alert>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Share "{guide?.title}" with your travel groups
                            </Typography>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Select Group</InputLabel>
                                <Select
                                    value={selectedGroup}
                                    label="Select Group"
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                >
                                    {myGroups.map((group) => (
                                        <MenuItem key={group._id} value={group._id}>
                                            {group.name} ({group.members?.length} members)
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowShareDialog(false)}>Cancel</Button>
                    <Button onClick={handleShareToGroup} variant="contained" disabled={!selectedGroup || shareSuccess}>
                        Share
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Lightbox Dialog */}
            {guide && (
                <Dialog
                    open={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    maxWidth="xl"
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor: 'rgba(0,0,0,0.9)',
                            boxShadow: 'none',
                            overflow: 'hidden',
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Close Button */}
                        <IconButton
                            onClick={() => setLightboxOpen(false)}
                            sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                        >
                            <Close />
                        </IconButton>

                        {/* Navigation Images */}
                        {guide.images?.length > 1 && (
                            <>
                                <IconButton
                                    onClick={() => setLightboxIndex(prev => (prev === 0 ? guide.images.length - 1 : prev - 1))}
                                    sx={{ position: 'absolute', left: 16, color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                                >
                                    <ChevronLeft fontSize="large" />
                                </IconButton>
                                <IconButton
                                    onClick={() => setLightboxIndex(prev => (prev + 1) % guide.images.length)}
                                    sx={{ position: 'absolute', right: 16, color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                                >
                                    <ChevronRight fontSize="large" />
                                </IconButton>
                            </>
                        )}

                        {/* Main Image */}
                        <Box
                            component="img"
                            src={guide.images?.[lightboxIndex]}
                            alt={`Gallery ${lightboxIndex + 1}`}
                            sx={{
                                maxHeight: '100%',
                                maxWidth: '100%',
                                objectFit: 'contain',
                            }}
                        />

                        {/* Counter */}
                        <Typography sx={{ position: 'absolute', bottom: 16, color: 'white' }}>
                            {lightboxIndex + 1} / {guide.images?.length}
                        </Typography>
                    </Box>
                </Dialog>
            )}
        </Box>
    );
}
