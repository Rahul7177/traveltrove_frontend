import { useState, useRef, useEffect } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon, LocationOn } from '@mui/icons-material';

// Demo data for suggestions (Simulating rich search results)
const FEATURED_DESTINATIONS = [
    { title: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=100&q=80' },
    { title: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=100&q=80' },
    { title: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=100&q=80' },
    { title: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4c2ce5d4d?auto=format&fit=crop&w=100&q=80' },
    { title: 'New York City, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e94f92c?auto=format&fit=crop&w=100&q=80' },
    { title: 'Machu Picchu, Peru', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=100&q=80' },
];

export default function SearchBar({ large = false, placeholder = "Search destinations..." }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        if (query.trim().length > 0) {
            const filtered = FEATURED_DESTINATIONS.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (title) => {
        setQuery(title);
        navigate(`/search?q=${encodeURIComponent(title)}`);
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
                    <SearchIcon sx={{ color: large ? 'white' : 'text.secondary', mr: 1, opacity: 0.8 }} />
                    <InputBase
                        inputRef={inputRef}
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (query) setShowSuggestions(true); }}
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
                            zIndex: 10,
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            bgcolor: large ? 'rgba(255, 255, 255, 0.95)' : 'background.paper',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <List disablePadding>
                            {suggestions.map((item, index) => (
                                <ListItem
                                    key={index}
                                    button
                                    onClick={() => handleSuggestionClick(item.title)}
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
                                        secondary="Popular Destination"
                                    />
                                </ListItem>
                            ))}
                        </List>
                        {suggestions.length === 0 && query && (
                            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                No suggestions found
                            </Box>
                        )}
                    </Paper>
                </Fade>
            </Box>
        </ClickAwayListener>
    );
}
