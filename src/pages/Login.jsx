import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Link,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    Explore,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #4A5D4F 0%, #2C3630 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <Explore sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                TravelTrove
                            </Typography>
                        </Box>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Welcome back! Sign in to continue.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>

                    <Typography textAlign="center" color="text.secondary">
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/register" underline="hover">
                            Sign up
                        </Link>
                    </Typography>

                    {/* Demo credentials */}
                    <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="body2">
                            <strong>Demo accounts:</strong><br />
                            Admin: admin@traveltrove.com / admin123<br />
                            User: traveler@example.com / user123
                        </Typography>
                    </Alert>
                </Paper>
            </Container>
        </Box>
    );
}
