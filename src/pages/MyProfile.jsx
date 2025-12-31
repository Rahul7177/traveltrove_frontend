import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Avatar,
    TextField,
    Button,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Person,
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    Dashboard,
    Edit,
    Save,
    Cancel,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function MyProfile() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile fields
    const [bio, setBio] = useState(user?.bio || '');
    const [editingBio, setEditingBio] = useState(false);

    // Password change
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleSaveBio = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await authAPI.updateProfile({ bio });
            // Update local user state if needed
            setEditingBio(false);
            setMessage({ type: 'success', text: 'Bio updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update bio' });
        }
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await authAPI.changePassword({ currentPassword, newPassword });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                My Profile
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                View and manage your account information
            </Typography>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </Alert>
            )}

            {/* Profile Info Card */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Avatar
                        src={user?.profilePicture}
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'primary.main',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            {user?.username}
                        </Typography>
                        <Typography color="text.secondary">
                            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                            })}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Username */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Person color="action" />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Username
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {user?.username}
                        </Typography>
                    </Box>
                </Box>

                {/* Email */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Email color="action" />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Email Address
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {user?.email}
                        </Typography>
                    </Box>
                </Box>

                {/* Bio */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Bio
                        </Typography>
                        {!editingBio ? (
                            <IconButton size="small" onClick={() => setEditingBio(true)}>
                                <Edit fontSize="small" />
                            </IconButton>
                        ) : (
                            <Box>
                                <IconButton size="small" onClick={handleSaveBio} disabled={loading} color="primary">
                                    <Save fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => { setEditingBio(false); setBio(user?.bio || ''); }}>
                                    <Cancel fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                    {editingBio ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            disabled={loading}
                        />
                    ) : (
                        <Typography variant="body1" color={bio ? 'text.primary' : 'text.secondary'}>
                            {bio || 'No bio added yet. Click edit to add one.'}
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Change Password Section */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Lock color="action" />
                        <Typography variant="h6" fontWeight="bold">
                            Change Password
                        </Typography>
                    </Box>
                    <Button
                        variant={showPasswordSection ? 'outlined' : 'contained'}
                        size="small"
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                    >
                        {showPasswordSection ? 'Cancel' : 'Change'}
                    </Button>
                </Box>

                {showPasswordSection && (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            type={showCurrentPassword ? 'text' : 'password'}
                            label="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            type={showNewPassword ? 'text' : 'password'}
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleChangePassword}
                            disabled={!currentPassword || !newPassword || !confirmPassword || loading}
                            startIcon={loading ? <CircularProgress size={16} /> : <Lock />}
                        >
                            Update Password
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Go to Dashboard Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ px: 4, py: 1.5 }}
                >
                    Go to Dashboard
                </Button>
            </Box>
        </Container>
    );
}
