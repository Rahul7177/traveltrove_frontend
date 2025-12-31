import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Button,
    Card,
    CardContent,
    Avatar,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Bookmark,
    Map,
    Add,
    Favorite,
    Edit,
    Delete,
} from '@mui/icons-material';
import GuideCard from '../components/GuideCard';
import ItineraryCard from '../components/ItineraryCard';
import { useAuth } from '../context/AuthContext';
import { usersAPI, itinerariesAPI } from '../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [savedData, setSavedData] = useState({ savedGuides: [], savedItineraries: [] });
    const [myItineraries, setMyItineraries] = useState([]);
    const [likedItineraries, setLikedItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [savedRes, itinerariesRes, likedRes] = await Promise.all([
                    usersAPI.getSaved(),
                    itinerariesAPI.getMy(),
                    itinerariesAPI.getLiked(),
                ]);
                setSavedData(savedRes.data);
                setMyItineraries(itinerariesRes.data);
                setLikedItineraries(likedRes.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleUnsaveGuide = (guideId) => {
        setSavedData(prev => ({
            ...prev,
            savedGuides: prev.savedGuides.filter(g => g._id !== guideId)
        }));
    };

    const handleUnsaveItinerary = (itineraryId) => {
        setSavedData(prev => ({
            ...prev,
            savedItineraries: prev.savedItineraries.filter(i => i._id !== itineraryId)
        }));
    };

    const handleDeleteItinerary = async (itineraryId) => {
        if (!confirm('Are you sure you want to delete this itinerary?')) return;

        try {
            await itinerariesAPI.delete(itineraryId);
            setMyItineraries(prev => prev.filter(i => i._id !== itineraryId));
        } catch (error) {
            console.error('Error deleting itinerary:', error);
        }
    };

    const handleEditItinerary = (itineraryId) => {
        navigate(`/edit-itinerary/${itineraryId}`);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Profile Header */}
            <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #ff5858 0%, #87CEEB 100%)', color: '#F9F7F2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                        src={user?.profilePicture}
                        sx={{ width: 80, height: 80, fontSize: '2rem' }}
                    >
                        {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: 'inherit' }}>
                            Welcome, {user?.username}!
                        </Typography>
                        <Typography sx={{ opacity: 0.9, color: 'inherit' }}>
                            {user?.bio || 'Ready for your next adventure?'}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary" fontWeight="bold">
                                {savedData.savedGuides?.length || 0}
                            </Typography>
                            <Typography color="text.secondary">Saved Guides</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="secondary" fontWeight="bold">
                                {savedData.savedItineraries?.length || 0}
                            </Typography>
                            <Typography color="text.secondary">Saved Itineraries</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {myItineraries.length || 0}
                            </Typography>
                            <Typography color="text.secondary">My Trips</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card component={RouterLink} to="/create-itinerary" sx={{ textDecoration: 'none' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Button variant="contained" startIcon={<Add />}>
                                Create Trip
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab icon={<Bookmark />} label="Saved Guides" />
                    <Tab icon={<Bookmark />} label="Saved Itineraries" />
                    <Tab icon={<Favorite />} label="Liked Itineraries" />
                    <Tab icon={<Map />} label="My Trips" />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Saved Guides */}
                    <TabPanel value={tabValue} index={0}>
                        {savedData.savedGuides?.length > 0 ? (
                            <Grid container spacing={3}>
                                {savedData.savedGuides.map((guide) => (
                                    <Grid item xs={12} sm={6} md={4} key={guide._id}>
                                        <GuideCard guide={guide} onSaveToggle={handleUnsaveGuide} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                No saved guides yet. <RouterLink to="/search">Explore destinations</RouterLink> to find guides to save.
                            </Alert>
                        )}
                    </TabPanel>

                    {/* Saved Itineraries */}
                    <TabPanel value={tabValue} index={1}>
                        {savedData.savedItineraries?.length > 0 ? (
                            <Grid container spacing={3}>
                                {savedData.savedItineraries.map((itinerary) => (
                                    <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
                                        <ItineraryCard itinerary={itinerary} onSaveToggle={handleUnsaveItinerary} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                No saved itineraries yet. Browse public itineraries to find ones to save.
                            </Alert>
                        )}
                    </TabPanel>

                    {/* Liked Itineraries */}
                    <TabPanel value={tabValue} index={2}>
                        {likedItineraries.length > 0 ? (
                            <Grid container spacing={3}>
                                {likedItineraries.map((itinerary) => (
                                    <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
                                        <ItineraryCard itinerary={itinerary} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                No liked itineraries yet. Like itineraries to see them here.
                            </Alert>
                        )}
                    </TabPanel>

                    {/* My Trips */}
                    <TabPanel value={tabValue} index={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                component={RouterLink}
                                to="/create-itinerary"
                                variant="contained"
                                startIcon={<Add />}
                            >
                                Create New Trip
                            </Button>
                        </Box>
                        {myItineraries.length > 0 ? (
                            <Grid container spacing={3}>
                                {myItineraries.map((itinerary) => (
                                    <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
                                        <Box sx={{ position: 'relative' }}>
                                            <ItineraryCard itinerary={itinerary} showCreator={false} />
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                display: 'flex',
                                                gap: 0.5,
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                borderRadius: 1,
                                                p: 0.5,
                                            }}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditItinerary(itinerary._id)}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteItinerary(itinerary._id)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                No trips created yet. <RouterLink to="/create-itinerary">Create your first trip</RouterLink>!
                            </Alert>
                        )}
                    </TabPanel>
                </>
            )}
        </Container>
    );
}
