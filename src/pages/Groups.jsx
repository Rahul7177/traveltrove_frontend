import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Badge,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Add,
    Public,
    Lock,
    People,
    VpnKey,
    Mail,
    Check,
    Close,
    Groups as GroupsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { groupsAPI } from '../services/api';

export default function Groups() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [allGroups, setAllGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [inviteCode, setInviteCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    // Invites state
    const [invites, setInvites] = useState([]);
    const [showInvitesDialog, setShowInvitesDialog] = useState(false);
    const [processingInvite, setProcessingInvite] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const allRes = await groupsAPI.getAllIncludingPrivate();
                setAllGroups(allRes.data);

                if (isAuthenticated) {
                    const [myRes, invitesRes] = await Promise.all([
                        groupsAPI.getMy(),
                        groupsAPI.getMyInvites(),
                    ]);
                    setMyGroups(myRes.data);
                    setInvites(invitesRes.data || []);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
            setLoading(false);
        };
        fetchGroups();
    }, [isAuthenticated]);

    const handleCreateGroup = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/create-group');
        }
    };

    const handleViewGroup = (group) => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            navigate(`/groups/${group._id}`);
        }
    };

    const handleJoinPrivateGroup = (group) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setSelectedGroup(group);
        setInviteCode('');
        setJoinError('');
        setShowJoinDialog(true);
    };

    const handleSubmitJoin = async () => {
        if (!inviteCode.trim()) {
            setJoinError('Please enter the invite code');
            return;
        }

        setJoining(true);
        setJoinError('');

        try {
            await groupsAPI.join(selectedGroup._id, { inviteCode: inviteCode.trim() });

            // Refresh groups
            const [allRes, myRes] = await Promise.all([
                groupsAPI.getAllIncludingPrivate(),
                groupsAPI.getMy(),
            ]);
            setAllGroups(allRes.data);
            setMyGroups(myRes.data);

            setShowJoinDialog(false);
            setSelectedGroup(null);
            setInviteCode('');

            // Navigate to the group
            navigate(`/groups/${selectedGroup._id}`);
        } catch (err) {
            setJoinError(err.response?.data?.message || 'Invalid invite code. Please try again.');
        }
        setJoining(false);
    };

    const handleAcceptInvite = async (groupId) => {
        setProcessingInvite(groupId);
        try {
            await groupsAPI.acceptInvite(groupId);

            // Refresh data
            const [allRes, myRes, invitesRes] = await Promise.all([
                groupsAPI.getAllIncludingPrivate(),
                groupsAPI.getMy(),
                groupsAPI.getMyInvites(),
            ]);
            setAllGroups(allRes.data);
            setMyGroups(myRes.data);
            setInvites(invitesRes.data || []);

            // Navigate to group
            navigate(`/groups/${groupId}`);
        } catch (err) {
            console.error('Error accepting invite:', err);
            alert(err.response?.data?.message || 'Failed to accept invite');
        }
        setProcessingInvite(null);
    };

    const handleRejectInvite = async (groupId) => {
        setProcessingInvite(groupId);
        try {
            await groupsAPI.rejectInvite(groupId);

            // Refresh invites
            const invitesRes = await groupsAPI.getMyInvites();
            setInvites(invitesRes.data || []);
        } catch (err) {
            console.error('Error rejecting invite:', err);
            alert(err.response?.data?.message || 'Failed to reject invite');
        }
        setProcessingInvite(null);
    };

    // Filter out groups user is already a member of from discover section
    // Convert IDs to strings for proper comparison
    const myGroupIds = myGroups.map(g => g._id?.toString() || g._id);
    const discoverGroups = allGroups.filter(g => {
        const groupId = g._id?.toString() || g._id;
        return !myGroupIds.includes(groupId);
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Travel Groups
                    </Typography>
                    <Typography color="text.secondary">
                        Connect with fellow travelers and share your adventures
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isAuthenticated && (
                        <Badge badgeContent={invites.length} color="error">
                            <Button
                                onClick={() => setShowInvitesDialog(true)}
                                variant="outlined"
                                startIcon={<Mail />}
                            >
                                Invites
                            </Button>
                        </Badge>
                    )}
                    <Button
                        onClick={handleCreateGroup}
                        variant="contained"
                        startIcon={<Add />}
                    >
                        Create Group
                    </Button>
                </Box>
            </Box>

            {/* My Groups */}
            {isAuthenticated && myGroups.length > 0 && (
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        My Groups
                    </Typography>
                    <Grid container spacing={3}>
                        {myGroups.map((group) => (
                            <Grid item xs={12} sm={6} md={4} key={group._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {group.name}
                                            </Typography>
                                            <Chip
                                                icon={group.private ? <Lock fontSize="small" /> : <Public fontSize="small" />}
                                                label={group.private ? 'Private' : 'Public'}
                                                size="small"
                                                color={group.private ? 'warning' : 'success'}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {group.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <People fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {group.members?.length || 0} members
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            component={RouterLink}
                                            to={`/groups/${group._id}`}
                                            size="small"
                                            color="primary"
                                        >
                                            View Group
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Discover Groups - Both Public and Private */}
            <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Discover Groups
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>Public groups</strong> can be joined directly. <strong>Private groups</strong> require an invite code from the creator.
                    </Typography>
                </Alert>
                {discoverGroups.length > 0 ? (
                    <Grid container spacing={3}>
                        {discoverGroups.map((group) => (
                            <Grid item xs={12} sm={6} md={4} key={group._id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: group.private ? '2px solid' : '1px solid',
                                        borderColor: group.private ? 'warning.main' : 'divider',
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {group.name}
                                            </Typography>
                                            <Chip
                                                icon={group.private ? <Lock fontSize="small" /> : <Public fontSize="small" />}
                                                label={group.private ? 'Private' : 'Public'}
                                                size="small"
                                                color={group.private ? 'warning' : 'success'}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {group.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <People fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    {group.members?.length || 0} members
                                                </Typography>
                                            </Box>
                                            {group.creator && (
                                                <Typography variant="caption" color="text.secondary">
                                                    by {group.creator.username}
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        {group.private ? (
                                            <Button
                                                onClick={() => handleJoinPrivateGroup(group)}
                                                size="small"
                                                color="warning"
                                                startIcon={<VpnKey />}
                                            >
                                                Enter Invite Code
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => handleViewGroup(group)}
                                                size="small"
                                                color="primary"
                                            >
                                                View & Join
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No groups available yet. Be the first to create one!
                    </Typography>
                )}
            </Box>

            {/* Join Private Group Dialog */}
            <Dialog open={showJoinDialog} onClose={() => setShowJoinDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Join Private Group
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Enter the invite code to join <strong>"{selectedGroup?.name}"</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        Contact the group creator <strong>{selectedGroup?.creator?.username}</strong> to get an invite code.
                    </Typography>

                    {joinError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {joinError}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Invite Code"
                        placeholder="Enter the invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        sx={{ mt: 2 }}
                        autoFocus
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmitJoin();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowJoinDialog(false)} disabled={joining}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitJoin}
                        variant="contained"
                        disabled={!inviteCode.trim() || joining}
                        startIcon={joining ? <CircularProgress size={16} /> : <VpnKey />}
                    >
                        {joining ? 'Joining...' : 'Join Group'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invites Dialog */}
            <Dialog open={showInvitesDialog} onClose={() => setShowInvitesDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Mail />
                        Group Invites
                        {invites.length > 0 && (
                            <Chip label={invites.length} color="error" size="small" />
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {invites.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <GroupsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography color="text.secondary">
                                You don't have any pending invites
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {invites.map((invite, index) => (
                                <Box key={invite.group?._id || index}>
                                    <ListItem
                                        secondaryAction={
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    color="success"
                                                    onClick={() => handleAcceptInvite(invite.group._id)}
                                                    disabled={processingInvite === invite.group._id}
                                                >
                                                    {processingInvite === invite.group._id ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <Check />
                                                    )}
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRejectInvite(invite.group._id)}
                                                    disabled={processingInvite === invite.group._id}
                                                >
                                                    <Close />
                                                </IconButton>
                                            </Box>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: invite.group?.private ? 'warning.main' : 'success.main' }}>
                                                {invite.group?.private ? <Lock /> : <Public />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={invite.group?.name || 'Unknown Group'}
                                            secondary={
                                                <>
                                                    Invited by {invite.invitedBy?.username || 'Unknown'}
                                                    <br />
                                                    {invite.group?.members?.length || 0} members
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < invites.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowInvitesDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
