import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import {
    Explore,
    Flight,
    Hotel,
    Restaurant,
    Hiking,
    TrendingUp,
} from '@mui/icons-material';
import SearchBar from '../components/SearchBar';
import GuideCard from '../components/GuideCard';
import ItineraryCard from '../components/ItineraryCard';
import { guidesAPI, itinerariesAPI } from '../services/api';

const categories = [
    { name: 'Adventure', icon: <Hiking />, color: '#ef4444' },
    { name: 'Cultural', icon: <Explore />, color: '#f59e0b' },
    { name: 'Nature', icon: <Flight />, color: '#10b981' },
    { name: 'Urban', icon: <Hotel />, color: '#6366f1' },
    { name: 'Leisure', icon: <Restaurant />, color: '#8b5cf6' },
];

export default function Home() {
    const [guides, setGuides] = useState([]);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [guidesRes, itinerariesRes] = await Promise.all([
                    guidesAPI.getAll(),
                    itinerariesAPI.getAll(),
                ]);
                setGuides(guidesRes.data.slice(0, 6));
                setItineraries(itinerariesRes.data.slice(0, 3));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    px: 2,
                    overflow: 'hidden',
                    // No background gradient, letting video show
                }}
            >
                {/* Video Background */}
                <Box
                    component="video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0,
                        filter: 'brightness(0.4)', // Lower brightness as requested
                    }}
                >
                    <source src="/videos/DroneShot.mp4" type="video/mp4" />
                </Box>

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', mb: 4 }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            fontWeight="bold"
                            sx={{ mb: 2, fontSize: { xs: '2rem', md: '3.5rem' }, color: 'white' }}
                        >
                            Discover Your Next Adventure
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{ opacity: 0.9, mb: 4, fontWeight: 400, color: 'white' }}
                        >
                            Explore curated destination guides and create personalized trip itineraries
                            for unforgettable travel experiences.
                        </Typography>

                        {/* Prominent Search Bar */}
                        <SearchBar large placeholder="Search beach destinations, cities, adventures..." />
                    </Box>

                    {/* Category Quick Links */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 4 }}>
                        {categories.map((cat) => (
                            <Chip
                                key={cat.name}
                                label={cat.name}
                                icon={cat.icon}
                                component={RouterLink}
                                to={`/search?category=${cat.name}`}
                                clickable
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    py: 2.5,
                                    px: 1,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                                    '& .MuiChip-icon': { color: 'white' },
                                }}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Featured Destinations */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Featured Destinations
                        </Typography>
                        <Typography color="text.secondary">
                            Explore our handpicked travel guides from around the world
                        </Typography>
                    </Box>
                    <Button
                        component={RouterLink}
                        to="/search"
                        variant="outlined"
                        endIcon={<TrendingUp />}
                    >
                        View All
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {guides.map((guide) => (
                            <Grid item xs={12} sm={6} md={4} key={guide._id}>
                                <GuideCard guide={guide} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Popular Itineraries */}
            {itineraries.length > 0 && (
                <Box sx={{ py: 8 }}> {/* Removed bg color here */}
                    <Box sx={{
                        maxWidth: '70%',
                        mx: 'auto',
                        filter: 'drop-shadow(3px 5px 2px rgba(0,0,0,0.15))' // Drop shadow on wrapper because clip-path clips shadow
                    }}>
                        <Box className="torn-paper" sx={{ p: 6 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                                        Popular Trip Plans
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Get inspired by itineraries created by fellow travelers
                                    </Typography>
                                </Box>
                                <Button
                                    component={RouterLink}
                                    to="/create-itinerary"
                                    variant="contained"
                                    color="secondary"
                                >
                                    Create Your Own
                                </Button>
                            </Box>

                            <Grid container spacing={3}>
                                {itineraries.map((itinerary) => (
                                    <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
                                        <ItineraryCard itinerary={itinerary} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                    Why TravelTrove?
                </Typography>
                <Typography color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
                    Everything you need for your perfect trip
                </Typography>

                <Grid container spacing={4}>
                    {[
                        {
                            icon: <Explore sx={{ fontSize: 48, color: 'primary.main' }} />,
                            title: 'Curated Guides',
                            description: 'Expert-crafted destination guides with insider tips and recommendations.',
                        },
                        {
                            icon: <Flight sx={{ fontSize: 48, color: 'secondary.main' }} />,
                            title: 'Custom Itineraries',
                            description: 'Create personalized day-by-day travel plans tailored to your preferences.',
                        },
                        {
                            icon: <TrendingUp sx={{ fontSize: 48, color: 'success.main' }} />,
                            title: 'Community Reviews',
                            description: 'Read authentic reviews and ratings from fellow travelers.',
                        },
                    ].map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ textAlign: 'center', height: '100%', boxShadow: 0, bgcolor: 'background.paper' }}> {/* Updated background */}
                                <CardContent sx={{ py: 4 }}>
                                    {feature.icon}
                                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #2C3630 0%, #1A211D 100%)',
                    color: 'white',
                    py: 8,
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                        Ready to Start Your Journey?
                    </Typography>
                    <Typography sx={{ opacity: 0.8, mb: 4, color: 'white' }}>
                        Join thousands of travelers who plan their adventures with TravelTrove.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            component={RouterLink}
                            to="/register"
                            variant="contained"
                            color="primary"
                            size="large"
                        >
                            Get Started Free
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/search"
                            variant="outlined"
                            size="large"
                            sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            Explore Destinations
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
