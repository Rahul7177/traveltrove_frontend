import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Link,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Explore,
    Facebook,
    Twitter,
    Instagram,
    LinkedIn,
    Hiking,
    BeachAccess,
    Museum,
    Park,
    LocationCity,
} from '@mui/icons-material';

const categories = [
    { name: 'Adventure', icon: <Hiking fontSize="small" /> },
    { name: 'Leisure', icon: <BeachAccess fontSize="small" /> },
    { name: 'Cultural', icon: <Museum fontSize="small" /> },
    { name: 'Nature', icon: <Park fontSize="small" /> },
    { name: 'Urban', icon: <LocationCity fontSize="small" /> },
];

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                py: 6,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand */}
                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Explore sx={{ mr: 1, color: 'secondary.main' }} />
                            <Typography variant="h6" color="inherit" fontWeight="bold">
                                TravelTrove
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Your ultimate travel planning and exploration platform. Discover curated
                            destination guides and create custom trip itineraries.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'secondary.main' } }}>
                                <Facebook />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'secondary.main' } }}>
                                <Twitter />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'secondary.main' } }}>
                                <Instagram />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'secondary.main' } }}>
                                <LinkedIn />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Destinations with Categories */}
                    <Grid item xs={6} md={3}>
                        <Typography variant="subtitle1" color="white" fontWeight="medium" gutterBottom>
                            Destinations
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link component={RouterLink} to="/search" color="inherit" underline="hover">
                                All Destinations
                            </Link>
                            <Typography variant="caption" color="grey.500" sx={{ mt: 1, mb: 0.5 }}>
                                By Category
                            </Typography>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.name}
                                    component={RouterLink}
                                    to={`/search?category=${cat.name}`}
                                    color="inherit"
                                    underline="hover"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                    {cat.icon} {cat.name}
                                </Link>
                            ))}
                        </Box>
                    </Grid>

                    {/* Community */}
                    <Grid item xs={6} md={3}>
                        <Typography variant="subtitle1" color="white" fontWeight="medium" gutterBottom>
                            Community
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link component={RouterLink} to="/groups" color="inherit" underline="hover">
                                Travel Groups
                            </Link>
                            <Link component={RouterLink} to="/create-itinerary" color="inherit" underline="hover">
                                Plan a Trip
                            </Link>
                            <Link component={RouterLink} to="/dashboard" color="inherit" underline="hover">
                                My Dashboard
                            </Link>
                            <Link component={RouterLink} to="/register" color="inherit" underline="hover">
                                Join TravelTrove
                            </Link>
                        </Box>
                    </Grid>

                    {/* Support */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="subtitle1" color="white" fontWeight="medium" gutterBottom>
                            Contact Us
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Have questions? We'd love to hear from you.
                        </Typography>
                        <Typography variant="body2" color="secondary.main">
                            support@traveltrove.com
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Mon - Fri: 9:00 AM - 6:00 PM
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: 'grey.800' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body2" color="grey.500">
                        © {new Date().getFullYear()} TravelTrove. All rights reserved.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Link href="#" color="grey.500" underline="hover" variant="body2">
                            Privacy Policy
                        </Link>
                        <Link href="#" color="grey.500" underline="hover" variant="body2">
                            Terms of Service
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
