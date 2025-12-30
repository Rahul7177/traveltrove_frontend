import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    IconButton,
    FormControlLabel,
    Switch,
    Divider,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    InputAdornment,
    Autocomplete,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CardMedia,
} from '@mui/material';
import {
    Add,
    Delete,
    CalendarMonth,
    LocationOn,
    Hotel,
    Restaurant,
    DirectionsRun,
    Close,
} from '@mui/icons-material';
import { itinerariesAPI, guidesAPI } from '../services/api';

// Currency symbols mapping
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
};

export default function CreateItinerary() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [guidesLoading, setGuidesLoading] = useState(true);
    const [error, setError] = useState('');
    const [guides, setGuides] = useState([]); // Available guides for destination dropdown
    const [selectedGuide, setSelectedGuide] = useState(null); // Currently selected destination guide
    const [recommendationTab, setRecommendationTab] = useState(0); // 0: Lodging, 1: Dining, 2: Activities

    // Dialog state for adding recommendation
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [selectedDayToAdd, setSelectedDayToAdd] = useState(1);

    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        durationDays: 1,
        startDate: '',
        endDate: '',
        budget: { amount: '', currency: 'USD' },
        isPublic: false,
        activities: [{ day: 1, items: [{ time: '09:00', activity: '', location: '', notes: '' }] }],
    });

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Get current currency symbol
    const currencySymbol = currencySymbols[formData.budget.currency] || '$';

    // Fetch guides for autocomplete
    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const response = await guidesAPI.getAll();
                setGuides(response.data);
            } catch (err) {
                console.error("Failed to fetch guides:", err);
            } finally {
                setGuidesLoading(false);
            }
        };
        fetchGuides();
    }, []);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleDestinationChange = (event, newValue) => {
        if (newValue) {
            setFormData(prev => ({ ...prev, destination: newValue.title }));
            setSelectedGuide(newValue);
        } else {
            setFormData(prev => ({ ...prev, destination: '' }));
            setSelectedGuide(null);
        }
    };

    // Handle start date change with validation
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setFormData(prev => {
            // If end date is before new start date, update end date too
            let newEndDate = prev.endDate;
            if (newEndDate && newEndDate < newStartDate) {
                newEndDate = newStartDate;
            }
            return { ...prev, startDate: newStartDate, endDate: newEndDate };
        });
    };

    // Handle end date change with validation
    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        // Only allow if end date >= start date
        if (formData.startDate && newEndDate < formData.startDate) {
            setError('End date must be same or after start date');
            return;
        }
        setError('');
        setFormData(prev => ({ ...prev, endDate: newEndDate }));
    };

    const handleDurationChange = (e) => {
        const days = parseInt(e.target.value) || 1;
        setFormData(prev => {
            const currentDays = prev.activities.length;
            let activities = [...prev.activities];

            if (days > currentDays) {
                for (let i = currentDays + 1; i <= days; i++) {
                    activities.push({ day: i, items: [{ time: '09:00', activity: '', location: '', notes: '' }] });
                }
            } else if (days < currentDays) {
                activities = activities.slice(0, days);
            }

            return { ...prev, durationDays: days, activities };
        });
    };

    const handleActivityChange = (dayIndex, itemIndex, field, value) => {
        setFormData(prev => {
            const activities = [...prev.activities];
            activities[dayIndex].items[itemIndex][field] = value;
            return { ...prev, activities };
        });
    };

    const addActivity = (dayIndex) => {
        setFormData(prev => {
            const activities = [...prev.activities];
            activities[dayIndex].items.push({ time: '09:00', activity: '', location: '', notes: '' });
            return { ...prev, activities };
        });
    };

    const removeActivity = (dayIndex, itemIndex) => {
        setFormData(prev => {
            const activities = [...prev.activities];
            if (activities[dayIndex].items.length > 1) {
                activities[dayIndex].items.splice(itemIndex, 1);
            }
            return { ...prev, activities };
        });
    };

    // Prepare to add recommendation
    const handleAddRecommendationClick = (item, type) => {
        setSelectedRecommendation({ ...item, type });
        // If typically specific day logic is needed, prompts user. Defaulting to Day 1 or current view logic for simplicity,
        // but here we will show a dialog to pick the day.
        setOpenAddDialog(true);
    };

    const confirmAddRecommendation = () => {
        if (!selectedRecommendation) return;

        const dayIndex = selectedDayToAdd - 1;
        const newItem = {
            time: '09:00', // Default time
            activity: selectedRecommendation.name,
            location: selectedGuide?.location?.city || '',
            notes: `${selectedRecommendation.type}: ${selectedRecommendation.description || ''}`
        };

        setFormData(prev => {
            const activities = [...prev.activities];
            // If the day currently has only one empty item, replace it? Or just push?
            // Let's decide to push to end of day list for safety.
            // Check if first item is empty (default state)
            const dayItems = activities[dayIndex].items;
            if (dayItems.length === 1 && !dayItems[0].activity && !dayItems[0].location) {
                activities[dayIndex].items[0] = newItem;
            } else {
                activities[dayIndex].items.push(newItem);
            }
            return { ...prev, activities };
        });

        setOpenAddDialog(false);
        setSelectedRecommendation(null);
    };

    const handleAddDay = () => {
        setFormData(prev => {
            const newDay = prev.activities.length + 1;
            return {
                ...prev,
                durationDays: newDay,
                activities: [
                    ...prev.activities,
                    { day: newDay, items: [{ time: '09:00', activity: '', location: '', notes: '' }] }
                ]
            };
        });
    };

    const handleRemoveDay = (dayIndex) => {
        setFormData(prev => {
            const newActivities = prev.activities.filter((__, index) => index !== dayIndex);
            // Re-index days
            const reindexedActivities = newActivities.map((day, index) => ({ ...day, day: index + 1 }));

            return {
                ...prev,
                durationDays: reindexedActivities.length,
                activities: reindexedActivities
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.destination) {
            setError('Please fill in title and destination');
            return;
        }

        // Validate dates
        if (formData.startDate && formData.startDate < today) {
            setError('Start date must be today or a future date');
            return;
        }

        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
            setError('End date must be same or after start date');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = {
                ...formData,
                budget: formData.budget.amount ? formData.budget : undefined,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
            };

            const response = await itinerariesAPI.create(data);
            navigate(`/itineraries/${response.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating itinerary');
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Create Trip Itinerary
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Plan your perfect trip day by day
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    {/* Trip Details - Full Width */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Trip Details
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Trip Title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        size="small"
                                        InputProps={{ sx: { fontSize: '0.9rem' } }}
                                        InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={guides}
                                        getOptionLabel={(option) => option.title}
                                        loading={guidesLoading}
                                        onChange={handleDestinationChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Destination"
                                                required
                                                fullWidth
                                                size="small"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    sx: { fontSize: '0.9rem' },
                                                    startAdornment: (
                                                        <>
                                                            <InputAdornment position="start">
                                                                <LocationOn color="action" fontSize="small" />
                                                            </InputAdornment>
                                                            {params.InputProps.startAdornment}
                                                        </>
                                                    ),
                                                    endAdornment: (
                                                        <>
                                                            {guidesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Duration (days)"
                                        name="durationDays"
                                        type="number"
                                        value={formData.durationDays}
                                        onChange={handleDurationChange}
                                        inputProps={{ min: 1, max: 30 }}
                                        size="small"
                                        InputProps={{
                                            sx: { fontSize: '0.9rem' },
                                            startAdornment: <CalendarMonth color="action" sx={{ mr: 1 }} fontSize="small" />,
                                        }}
                                        InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Start Date"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleStartDateChange}
                                        InputLabelProps={{ shrink: true, sx: { fontSize: '0.9rem' } }}
                                        inputProps={{ min: today }}
                                        size="small"
                                        InputProps={{ sx: { fontSize: '0.9rem' } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="End Date"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleEndDateChange}
                                        InputLabelProps={{ shrink: true, sx: { fontSize: '0.9rem' } }}
                                        inputProps={{ min: formData.startDate || today }}
                                        size="small"
                                        InputProps={{ sx: { fontSize: '0.9rem' } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={8}>
                                            <TextField
                                                fullWidth
                                                label="Budget"
                                                name="budget.amount"
                                                type="number"
                                                value={formData.budget.amount}
                                                onChange={handleChange}
                                                size="small"
                                                InputProps={{
                                                    sx: { fontSize: '0.9rem' },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{currencySymbol}</Typography>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="Currency"
                                                name="budget.currency"
                                                value={formData.budget.currency}
                                                onChange={handleChange}
                                                SelectProps={{ native: true, sx: { fontSize: '0.9rem' } }}
                                                size="small"
                                                InputLabelProps={{ sx: { fontSize: '0.9rem' } }}
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="INR">INR (₹)</option>
                                                <option value="JPY">JPY (¥)</option>
                                                <option value="AUD">AUD (A$)</option>
                                                <option value="CAD">CAD (C$)</option>
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.isPublic}
                                                onChange={handleChange}
                                                name="isPublic"
                                                color="secondary"
                                                size="small"
                                            />
                                        }
                                        label={<Typography fontSize="0.9rem">Make public</Typography>}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Day-by-Day Activities - Full Width */}
                    <Grid item xs={12}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Day-by-Day Plan
                        </Typography>

                        {formData.activities.map((day, dayIndex) => (
                            <Card key={dayIndex} sx={{ mb: 3, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" color="secondary" fontWeight="bold">
                                            Day {day.day}
                                        </Typography>
                                        {formData.activities.length > 1 && (
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<Delete />}
                                                onClick={() => handleRemoveDay(dayIndex)}
                                            >
                                                Remove Day
                                            </Button>
                                        )}
                                    </Box>

                                    {/* Activities List */}
                                    {day.items.map((item, itemIndex) => (
                                        <Box key={itemIndex} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={2}>
                                                    <TextField
                                                        fullWidth
                                                        label="Time"
                                                        type="time"
                                                        value={item.time}
                                                        onChange={(e) => handleActivityChange(dayIndex, itemIndex, 'time', e.target.value)}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Activity"
                                                        value={item.activity}
                                                        onChange={(e) => handleActivityChange(dayIndex, itemIndex, 'activity', e.target.value)}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Location"
                                                        value={item.location}
                                                        onChange={(e) => handleActivityChange(dayIndex, itemIndex, 'location', e.target.value)}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
                                                    <TextField
                                                        fullWidth
                                                        label="Notes"
                                                        value={item.notes}
                                                        onChange={(e) => handleActivityChange(dayIndex, itemIndex, 'notes', e.target.value)}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={1}>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => removeActivity(dayIndex, itemIndex)}
                                                        disabled={day.items.length === 1}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}

                                    <Button
                                        startIcon={<Add />}
                                        onClick={() => addActivity(dayIndex)}
                                        size="small"
                                        color="secondary"
                                    >
                                        Add Activity
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={handleAddDay}
                            fullWidth
                            sx={{ mt: 2, mb: 4, py: 1.5, borderStyle: 'dashed' }}
                        >
                            Add Day {formData.activities.length + 1}
                        </Button>

                        {/* Recommendations Section */}
                        {selectedGuide && selectedGuide.recommendations && (
                            <Box sx={{ mt: 6, mb: 4 }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom color="secondary.main">
                                    Recommendations for {selectedGuide.title}
                                </Typography>
                                <Paper sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
                                    <Tabs
                                        value={recommendationTab}
                                        onChange={(e, v) => setRecommendationTab(v)}
                                        textColor="secondary"
                                        indicatorColor="secondary"
                                        variant="fullWidth"
                                    >
                                        <Tab icon={<Hotel />} label="Lodging" />
                                        <Tab icon={<Restaurant />} label="Dining" />
                                        <Tab icon={<DirectionsRun />} label="Activities" />
                                    </Tabs>

                                    <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                                        {/* Lodging Panel */}
                                        {recommendationTab === 0 && (
                                            <Grid container spacing={2}>
                                                {selectedGuide.recommendations.lodging?.map((item, i) => (
                                                    <Grid item xs={12} sm={6} key={i}>
                                                        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                            <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                                                                {item.description}
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                color="secondary"
                                                                size="small"
                                                                startIcon={<Add />}
                                                                onClick={() => handleAddRecommendationClick(item, 'Lodging')}
                                                            >
                                                                Add to Itinerary
                                                            </Button>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                                {(!selectedGuide.recommendations.lodging || selectedGuide.recommendations.lodging.length === 0) && (
                                                    <Typography sx={{ p: 2 }}>No lodging recommendations found.</Typography>
                                                )}
                                            </Grid>
                                        )}

                                        {/* Dining Panel */}
                                        {recommendationTab === 1 && (
                                            <Grid container spacing={2}>
                                                {selectedGuide.recommendations.dining?.map((item, i) => (
                                                    <Grid item xs={12} sm={6} key={i}>
                                                        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                            <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary">{item.cuisine}</Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                                                                {item.description}
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                color="secondary"
                                                                size="small"
                                                                startIcon={<Add />}
                                                                onClick={() => handleAddRecommendationClick(item, 'Dining')}
                                                            >
                                                                Add to Itinerary
                                                            </Button>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                                {(!selectedGuide.recommendations.dining || selectedGuide.recommendations.dining.length === 0) && (
                                                    <Typography sx={{ p: 2 }}>No dining recommendations found.</Typography>
                                                )}
                                            </Grid>
                                        )}

                                        {/* Activities Panel */}
                                        {recommendationTab === 2 && (
                                            <Grid container spacing={2}>
                                                {selectedGuide.recommendations.activities?.map((item, i) => (
                                                    <Grid item xs={12} sm={6} key={i}>
                                                        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                            <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                                                                {item.description}
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                color="secondary"
                                                                size="small"
                                                                startIcon={<Add />}
                                                                onClick={() => handleAddRecommendationClick(item, 'Activity')}
                                                            >
                                                                Add to Itinerary
                                                            </Button>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                                {(!selectedGuide.recommendations.activities || selectedGuide.recommendations.activities.length === 0) && (
                                                    <Typography sx={{ p: 2 }}>No activity recommendations found.</Typography>
                                                )}
                                            </Grid>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        {/* Duplicate Submit Button at the bottom */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                size="large"
                                disabled={loading}
                                sx={{ borderRadius: 2, fontWeight: 'bold', px: 6 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Itinerary'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Dialog to select day when adding recommendation */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle>Add to Itinerary</DialogTitle>
                <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                    <Typography gutterBottom>
                        Add <strong>{selectedRecommendation?.name}</strong> to:
                    </Typography>
                    <TextField
                        select
                        fullWidth
                        label="Select Day"
                        value={selectedDayToAdd}
                        onChange={(e) => setSelectedDayToAdd(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{ mt: 2 }}
                    >
                        {formData.activities.map((day) => (
                            <option key={day.day} value={day.day}>
                                Day {day.day}
                            </option>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button onClick={confirmAddRecommendation} variant="contained" color="secondary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
