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
import { useAuth } from '../context/AuthContext';

const categories = [
    { name: 'Adventure', icon: <Hiking />, color: '#ef4444' },
    { name: 'Cultural', icon: <Explore />, color: '#f59e0b' },
    { name: 'Nature', icon: <Flight />, color: '#10b981' },
    { name: 'Urban', icon: <Hotel />, color: '#6366f1' },
    { name: 'Leisure', icon: <Restaurant />, color: '#8b5cf6' },
];

export default function Home() {
    const { isAuthenticated } = useAuth();
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
                    height: 'calc(100vh - 64px)',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: { xs: 1, sm: 2 },
                    py: { xs: 2, sm: 4 },
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
                        filter: 'brightness(0.4)',
                    }}
                >
                    <source src="/videos/DroneShot.mp4" type="video/mp4" />
                </Box>

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
                    <Box sx={{ textAlign: 'center', maxWidth: { xs: '100%', sm: 800 }, mx: 'auto', mb: { xs: 2, sm: 4 } }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            fontWeight="bold"
                            sx={{
                                mb: { xs: 1, sm: 2 },
                                fontSize: {
                                    xs: '1.5rem',
                                    sm: '2rem',
                                    md: '3.5rem'
                                },
                                color: 'white',
                                lineHeight: 1.2
                            }}
                        >
                            Discover Your Next Adventure
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                opacity: 0.9,
                                mb: { xs: 2, sm: 4 },
                                fontWeight: 400,
                                color: 'white',
                                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                                display: { xs: 'none', sm: 'block' },
                                px: { xs: 1, sm: 0 }
                            }}
                        >
                            Explore curated destination guides and create personalized trip itineraries
                            for unforgettable travel experiences.
                        </Typography>

                        {/* Prominent Search Bar */}
                        <SearchBar large placeholder="Search beach destinations, cities, adventures..." />
                    </Box>

                    {/* Category Quick Links */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap', mt: { xs: 2, sm: 4 } }}>
                        {categories.map((cat) => (
                            <Chip
                                key={cat.name}
                                label={cat.name}
                                icon={cat.icon}
                                component={RouterLink}
                                to={`/search?category=${cat.name}`}
                                clickable
                                sx={{
                                    bgcolor: cat.color,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.75rem', sm: '0.95rem' },
                                    py: { xs: 2, sm: 3 },
                                    px: { xs: 1, sm: 2 },
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        bgcolor: cat.color,
                                        filter: 'brightness(1.1)',
                                        transform: 'translateY(-3px)'
                                    },
                                    '& .MuiChip-icon': {
                                        color: 'white',
                                        fontSize: { xs: '16px', sm: '20px' },
                                        marginLeft: { xs: '4px', sm: '8px' },
                                        marginRight: { xs: '-4px', sm: '-2px' }
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Featured Destinations */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 }, px: { xs: 2, sm: 3 } }}>
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
                        sx={{
                            borderColor: 'secondary.main',
                            color: 'secondary.main',
                            borderWidth: 2,
                            px: 3,
                            '&:hover': {
                                backgroundColor: 'secondary.main',
                                color: 'white',
                                borderColor: 'secondary.main'
                            }
                        }}
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
                <Box sx={{ py: 8, backgroundColor: 'background.paper' }}> {/* Removed bg color here */}
                    <Box sx={{
                        maxWidth: '70%',
                        mx: 'auto',
                        filter: 'drop-shadow(3px 5px 2px rgba(0,0,0,0.15))' // Drop shadow on wrapper because clip-path clips shadow
                    }}>
                        <Box className="torn-paper" sx={{ p: 6, backgroundColor: 'secondary.main' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                                        Popular Trip Plans
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ color: 'white' }}>
                                        Get inspired by itineraries created by fellow travelers
                                    </Typography>
                                </Box>
                                <Button
                                    component={RouterLink}
                                    to="/create-itinerary"
                                    variant="contained"
                                    color="primary"
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
                    background: 'linear-gradient(135deg, #ff5858 0%, #C63939 100%)', // Vibrant Coral Gradient
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
                            to={isAuthenticated ? "/" : "/register"}
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
