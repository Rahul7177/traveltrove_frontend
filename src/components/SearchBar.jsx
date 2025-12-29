import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper,
    InputBase,
    IconButton,
    Box,
    alpha,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export default function SearchBar({ large = false, placeholder = "Search destinations..." }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: large ? 600 : 400,
                mx: 'auto',
                borderRadius: large ? 50 : 2,
                boxShadow: large ? '0 10px 40px rgba(0,0,0,0.15)' : 1,
                px: large ? 3 : 2,
                py: large ? 1 : 0.5,
                bgcolor: 'background.paper',
                border: large ? '2px solid' : 'none',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: large ? '0 15px 50px rgba(0,0,0,0.2)' : 3,
                },
                '&:focus-within': {
                    borderColor: 'primary.main',
                },
            }}
        >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                    flex: 1,
                    fontSize: large ? '1.1rem' : '1rem',
                    py: large ? 1 : 0.5,
                }}
                inputProps={{ 'aria-label': 'search destinations' }}
            />
            <IconButton
                type="submit"
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                }}
            >
                <SearchIcon />
            </IconButton>
        </Paper>
    );
}
