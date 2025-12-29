import { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Paper,
    Button,
    IconButton,
} from '@mui/material';
import { Search as SearchIcon, Clear } from '@mui/icons-material';
import GuideCard from '../components/GuideCard';
import { guidesAPI } from '../services/api';

const categories = ['All', 'Adventure', 'Leisure', 'Cultural', 'Nature', 'Urban'];

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');

    // Sync local state with URL params when they change
    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '');
        setCategory(searchParams.get('category') || 'All');
    }, [searchParams]);

    // Fetch guides when search params change
    useEffect(() => {
        const fetchGuides = async () => {
            setLoading(true);
            try {
                const params = {};
                const q = searchParams.get('q');
                const cat = searchParams.get('category');
                if (q) params.search = q;
                if (cat && cat !== 'All') params.category = cat;

                const response = await guidesAPI.getAll(params);
                setGuides(response.data);
            } catch (error) {
                console.error('Error fetching guides:', error);
            }
            setLoading(false);
        };

        fetchGuides();
    }, [searchParams]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (category !== 'All') params.set('category', category);
        setSearchParams(params);
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (newCategory !== 'All') params.set('category', newCategory);
        setSearchParams(params);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        const params = new URLSearchParams();
        if (category !== 'All') params.set('category', category);
        setSearchParams(params);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Search Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Explore Destinations
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {searchParams.get('q') ? (
                        <>Showing results for "<strong>{searchParams.get('q')}</strong>"</>
                    ) : (
                        'Browse all destinations or search for something specific'
                    )}
                </Typography>

                {/* Search and Filters */}
                <Paper
                    component="form"
                    onSubmit={handleSearch}
                    sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
                >
                    <TextField
                        placeholder="Search by name, city, or country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="small"
                        sx={{ flexGrow: 1, minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleClearSearch}>
                                        <Clear fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            label="Category"
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SearchIcon />}
                        sx={{ px: 3 }}
                    >
                        Search
                    </Button>
                </Paper>

                {/* Category Chips */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    {categories.map((cat) => (
                        <Chip
                            key={cat}
                            label={cat}
                            onClick={() => handleCategoryChange(cat)}
                            color={category === cat ? 'primary' : 'default'}
                            variant={category === cat ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>
            </Box>

            {/* Results */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : guides.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                        No results found. Try adjusting your search or filters.
                    </Alert>
                    <Typography color="text.secondary">
                        Can't find what you're looking for?
                    </Typography>
                    <Chip
                        label="View all destinations"
                        onClick={() => {
                            setSearchQuery('');
                            setCategory('All');
                            setSearchParams({});
                        }}
                        sx={{ mt: 2 }}
                    />
                </Box>
            ) : (
                <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {guides.length} destination{guides.length !== 1 ? 's' : ''} found
                    </Typography>
                    <Grid container spacing={3}>
                        {guides.map((guide) => (
                            <Grid item xs={12} sm={6} md={4} key={guide._id}>
                                <GuideCard guide={guide} />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Container>
    );
}
