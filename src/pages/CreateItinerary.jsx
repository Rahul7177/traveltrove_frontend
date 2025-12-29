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
} from '@mui/material';
import {
    Add,
    Delete,
    CalendarMonth,
    LocationOn,
} from '@mui/icons-material';
import { itinerariesAPI } from '../services/api';

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
    const [error, setError] = useState('');
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Create Trip Itinerary
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Plan your perfect trip day by day
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    {/* Trip Details */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Trip Details
                            </Typography>

                            <TextField
                                fullWidth
                                label="Trip Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Destination"
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                required
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />,
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Duration (days)"
                                name="durationDays"
                                type="number"
                                value={formData.durationDays}
                                onChange={handleDurationChange}
                                inputProps={{ min: 1, max: 30 }}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: <CalendarMonth color="action" sx={{ mr: 1 }} />,
                                }}
                            />

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Start Date"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleStartDateChange}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ min: today }}
                                        helperText="Must be today or later"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="End Date"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleEndDateChange}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ min: formData.startDate || today }}
                                        helperText="Must be ≥ start date"
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={8}>
                                    <TextField
                                        fullWidth
                                        label="Budget"
                                        name="budget.amount"
                                        type="number"
                                        value={formData.budget.amount}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Typography sx={{ fontWeight: 'bold' }}>{currencySymbol}</Typography>
                                                </InputAdornment>
                                            ),
                                        }}
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
                                        SelectProps={{ native: true }}
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

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                        name="isPublic"
                                    />
                                }
                                label="Make public"
                            />

                            <Divider sx={{ my: 3 }} />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Create Itinerary'}
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Day-by-Day Activities */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Day-by-Day Plan
                        </Typography>

                        {formData.activities.map((day, dayIndex) => (
                            <Card key={dayIndex} sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                                        Day {day.day}
                                    </Typography>

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
                                    >
                                        Add Activity
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}
