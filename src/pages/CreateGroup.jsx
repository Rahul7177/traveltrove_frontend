import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    FormControlLabel,
    Switch,
    Alert,
    CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { groupsAPI } from '../services/api';

export default function CreateGroup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        private: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await groupsAPI.create(formData);
            navigate(`/groups/${response.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating group');
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/groups')} sx={{ mb: 2 }}>
                Back to Groups
            </Button>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Create Travel Group
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Start a community for fellow travelers
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Group Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                        helperText="Describe what this group is about"
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.private}
                                onChange={handleChange}
                                name="private"
                            />
                        }
                        label="Private group (requires invite code to join)"
                        sx={{ mb: 3 }}
                    />

                    {formData.private && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            An invite code will be generated automatically. You can share it with members after creating the group.
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create Group'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
