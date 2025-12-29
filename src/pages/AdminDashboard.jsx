import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Tooltip,
} from '@mui/material';
import {
    People,
    Map,
    RateReview,
    Explore,
    Delete,
    Edit,
    Add,
    Visibility,
} from '@mui/icons-material';
import { adminAPI, guidesAPI, itinerariesAPI, reviewsAPI } from '../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AdminDashboard() {
    const [tabValue, setTabValue] = useState(0);
    const [stats, setStats] = useState({});
    const [guides, setGuides] = useState([]);
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Guide form state
    const [guideDialog, setGuideDialog] = useState(false);
    const [editingGuide, setEditingGuide] = useState(null);
    const [guideForm, setGuideForm] = useState({
        title: '',
        description: '',
        'location.country': '',
        'location.city': '',
        category: 'Adventure',
        history: '',
        culture: '',
        images: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, reviewsRes, itinerariesRes, guidesRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers(),
                adminAPI.getReviews(),
                adminAPI.getItineraries(),
                guidesAPI.getAll(),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setReviews(reviewsRes.data);
            setItineraries(itinerariesRes.data);
            setGuides(guidesRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading admin data');
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating role');
        }
    };

    const openGuideForm = (guide = null) => {
        if (guide) {
            setEditingGuide(guide);
            setGuideForm({
                title: guide.title || '',
                description: guide.description || '',
                'location.country': guide.location?.country || '',
                'location.city': guide.location?.city || '',
                category: guide.category || 'Adventure',
                history: guide.history || '',
                culture: guide.culture || '',
                images: guide.images?.join(', ') || '',
            });
        } else {
            setEditingGuide(null);
            setGuideForm({
                title: '',
                description: '',
                'location.country': '',
                'location.city': '',
                category: 'Adventure',
                history: '',
                culture: '',
                images: '',
            });
        }
        setGuideDialog(true);
    };

    const handleSaveGuide = async () => {
        try {
            const guideData = {
                title: guideForm.title,
                description: guideForm.description,
                location: {
                    country: guideForm['location.country'],
                    city: guideForm['location.city'],
                },
                category: guideForm.category,
                history: guideForm.history,
                culture: guideForm.culture,
                images: guideForm.images.split(',').map(s => s.trim()).filter(s => s),
            };

            if (editingGuide) {
                await guidesAPI.update(editingGuide._id, guideData);
            } else {
                await guidesAPI.create(guideData);
            }

            setGuideDialog(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving guide');
        }
    };

    const handleDeleteGuide = async (guideId) => {
        if (!confirm('Are you sure you want to delete this guide?')) return;
        try {
            await guidesAPI.delete(guideId);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting guide');
        }
    };

    const handleDeleteItinerary = async (itineraryId) => {
        if (!confirm('Are you sure you want to delete this itinerary?')) return;
        try {
            await itinerariesAPI.delete(itineraryId);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting itinerary');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewsAPI.delete(reviewId);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting review');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Admin Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Manage destination guides, itineraries, users, and reviews
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Explore sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{stats.guides || 0}</Typography>
                            <Typography>Guides</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Map sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{stats.itineraries || 0}</Typography>
                            <Typography>Itineraries</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <People sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{stats.users || 0}</Typography>
                            <Typography>Users</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <RateReview sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold">{stats.reviews || 0}</Typography>
                            <Typography>Reviews</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab icon={<Explore />} label="Guides" />
                    <Tab icon={<Map />} label="Itineraries" />
                    <Tab icon={<People />} label="Users" />
                    <Tab icon={<RateReview />} label="Reviews" />
                </Tabs>
            </Box>

            {/* Guides Tab */}
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="contained" startIcon={<Add />} onClick={() => openGuideForm()}>
                        Add New Guide
                    </Button>
                </Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {guides.map((guide) => (
                                <TableRow key={guide._id}>
                                    <TableCell>{guide.title}</TableCell>
                                    <TableCell>{guide.location?.city}, {guide.location?.country}</TableCell>
                                    <TableCell>
                                        <Chip label={guide.category} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Rating value={guide.averageRating || 0} size="small" readOnly precision={0.1} />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="View">
                                            <IconButton component={RouterLink} to={`/guides/${guide._id}`} size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => openGuideForm(guide)} size="small" color="primary">
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDeleteGuide(guide._id)} size="small" color="error">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Itineraries Tab */}
            <TabPanel value={tabValue} index={1}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Destination</TableCell>
                                <TableCell>Creator</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Public</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {itineraries.map((itinerary) => (
                                <TableRow key={itinerary._id}>
                                    <TableCell>{itinerary.title}</TableCell>
                                    <TableCell>{itinerary.destination}</TableCell>
                                    <TableCell>{itinerary.creator?.username || 'Guest'}</TableCell>
                                    <TableCell>{itinerary.durationDays} days</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={itinerary.isPublic ? 'Yes' : 'No'}
                                            color={itinerary.isPublic ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="View">
                                            <IconButton component={RouterLink} to={`/itineraries/${itinerary._id}`} size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDeleteItinerary(itinerary._id)} size="small" color="error">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Users Tab */}
            <TabPanel value={tabValue} index={2}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            color={user.role === 'admin' ? 'primary' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                                        >
                                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={3}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Destination</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Comment</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow key={review._id}>
                                    <TableCell>{review.user?.username || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={review.targetModel === 'Guide' ? review.targetId?.title || 'Guide' : review.targetId?.title || 'Itinerary'}
                                            size="small"
                                            color={review.targetModel === 'Guide' ? 'primary' : 'secondary'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Rating value={review.rating} size="small" readOnly />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {review.comment}
                                    </TableCell>
                                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDeleteReview(review._id)} size="small" color="error">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* Guide Form Dialog */}
            <Dialog open={guideDialog} onClose={() => setGuideDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingGuide ? 'Edit Guide' : 'Create New Destination Guide'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={guideForm.title}
                                onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Country"
                                value={guideForm['location.country']}
                                onChange={(e) => setGuideForm({ ...guideForm, 'location.country': e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={guideForm['location.city']}
                                onChange={(e) => setGuideForm({ ...guideForm, 'location.city': e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Category"
                                value={guideForm.category}
                                onChange={(e) => setGuideForm({ ...guideForm, category: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="Adventure">Adventure</option>
                                <option value="Leisure">Leisure</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Nature">Nature</option>
                                <option value="Urban">Urban</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={guideForm.description}
                                onChange={(e) => setGuideForm({ ...guideForm, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="History"
                                value={guideForm.history}
                                onChange={(e) => setGuideForm({ ...guideForm, history: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Culture"
                                value={guideForm.culture}
                                onChange={(e) => setGuideForm({ ...guideForm, culture: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Image URLs (comma separated)"
                                value={guideForm.images}
                                onChange={(e) => setGuideForm({ ...guideForm, images: e.target.value })}
                                helperText="Enter image URLs separated by commas"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGuideDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveGuide}>
                        {editingGuide ? 'Save Changes' : 'Create Guide'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
