import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper,
    InputBase,
    IconButton,
    Box,
    alpha,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    ClickAwayListener,
    Fade,
    CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, LocationOn } from '@mui/icons-material';
import { guidesAPI } from '../services/api';

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default function SearchBar({ large = false, placeholder = "Search destinations..." }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Fetch suggestions from database
    const fetchSuggestions = async (searchQuery) => {
        if (searchQuery.trim().length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLoading(true);
        try {
            const response = await guidesAPI.searchSuggestions(searchQuery, 6);
            const guides = response.data;

            // Transform guides to suggestion format
            const formattedSuggestions = guides.map(guide => ({
                id: guide._id,
                title: guide.title,
                location: guide.location?.city
                    ? `${guide.location.city}${guide.location.country ? ', ' + guide.location.country : ''}`
                    : guide.location?.country || '',
                image: guide.images?.[0] || null,
                category: guide.category,
            }));

            setSuggestions(formattedSuggestions);
            setShowSuggestions(formattedSuggestions.length > 0);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced version of fetchSuggestions (300ms delay)
    const debouncedFetchSuggestions = useCallback(
        debounce((searchQuery) => fetchSuggestions(searchQuery), 300),
        []
    );

    useEffect(() => {
        if (query.trim().length >= 1) {
            debouncedFetchSuggestions(query);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query, debouncedFetchSuggestions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        // Use the title for search
        const searchTerm = suggestion.title;
        setQuery(searchTerm);
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setShowSuggestions(false);
    };

    return (
        <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: large ? 600 : 400, mx: 'auto' }}>
                <Paper
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: large ? 24 : 2, // Rounded pill shape for large
                        boxShadow: large ? '0 8px 32px rgba(0,0,0,0.2)' : 1,
                        px: large ? 3 : 2,
                        py: large ? 1 : 0.5,
                        // Translucency for large/hero search
                        bgcolor: large ? 'rgba(255, 255, 255, 0.25)' : 'background.paper',
                        backdropFilter: large ? 'blur(12px)' : 'none',
                        border: large ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            bgcolor: large ? 'rgba(255, 255, 255, 0.35)' : 'background.paper',
                            boxShadow: large ? '0 12px 40px rgba(0,0,0,0.25)' : 3,
                        },
                        '&:focus-within': {
                            bgcolor: large ? 'rgba(255, 255, 255, 0.4)' : 'background.paper',
                            borderColor: large ? 'rgba(255, 255, 255, 0.5)' : 'primary.main',
                        },
                    }}
                >
                    {/* <SearchIcon sx={{ color: large ? 'white' : 'text.secondary', mr: 1, opacity: 0.8 }} /> */}
                    <InputBase
                        inputRef={inputRef}
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        sx={{
                            flex: 1,
                            fontSize: large ? '1.1rem' : '1rem',
                            py: large ? 1 : 0.5,
                            color: large ? 'white' : 'text.primary',
                            '& ::placeholder': {
                                color: large ? 'rgba(255,255,255,0.8)' : 'text.disabled',
                                opacity: 1,
                            }
                        }}
                        inputProps={{ 'aria-label': 'search destinations', autoComplete: 'off' }}
                    />
                    {loading ? (
                        <CircularProgress size={20} sx={{ mr: 1, color: large ? 'white' : 'primary.main' }} />
                    ) : null}
                    <IconButton
                        type="submit"
                        sx={{
                            bgcolor: large ? 'primary.main' : 'primary.main',
                            color: 'white',
                            p: large ? 1.5 : 1,
                            '&:hover': { bgcolor: 'primary.dark' },
                        }}
                    >
                        <SearchIcon fontSize={large ? "medium" : "small"} />
                    </IconButton>
                </Paper>

                {/* Suggestions Dropdown */}
                <Fade in={showSuggestions && suggestions.length > 0}>
                    <Paper
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            mt: 1,
                            zIndex: 1000,
                            borderRadius: 1,
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            bgcolor: large ? 'rgba(255, 255, 255, 0.95)' : 'background.paper',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <List disablePadding>
                            {suggestions.map((item, index) => (
                                <ListItem
                                    key={item.id || index}
                                    button
                                    onClick={() => handleSuggestionClick(item)}
                                    sx={{
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                                        borderBottom: index < suggestions.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={item.image}
                                            variant="rounded"
                                            sx={{ width: 48, height: 48, mr: 1 }}
                                        >
                                            <LocationOn />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                                {item.title}
                                            </Typography>
                                        }
                                        secondary={item.location || item.category || 'Destination'}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Fade>
            </Box>
        </ClickAwayListener>
    );
}
