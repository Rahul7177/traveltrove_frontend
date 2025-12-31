import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Avatar,
    TextField,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Grid,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    ArrowBack,
    Public,
    Lock,
    People,
    Send,
    ContentCopy,
    ExitToApp,
    Delete,
    Edit,
    Share,
    Reply,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { groupsAPI } from '../services/api';

export default function GroupDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newPost, setNewPost] = useState('');
    const [posting, setPosting] = useState(false);
    const [joining, setJoining] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showMembersDialog, setShowMembersDialog] = useState(false);
    const [inviteInput, setInviteInput] = useState('');
    const [editForm, setEditForm] = useState({ name: '', description: '', private: false });

    // Email invite state
    const [showEmailInviteDialog, setShowEmailInviteDialog] = useState(false);
    const [emailToInvite, setEmailToInvite] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    // Reply state
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState({});

    const isMember = group?.members?.some(m => m._id === user?._id);
    const isCreator = group?.creator?._id === user?._id;

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await groupsAPI.getById(id);
                setGroup(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Group not found');
            }
            setLoading(false);
        };
        fetchGroup();
    }, [id]);

    const handleJoin = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (group.private && !inviteInput) {
            setShowInviteDialog(true);
            return;
        }

        setJoining(true);
        try {
            await groupsAPI.join(id, group.private ? { inviteCode: inviteInput } : {});
            const response = await groupsAPI.getById(id);
            setGroup(response.data);
            setShowInviteDialog(false);
            setInviteInput('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join group');
        }
        setJoining(false);
    };

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave this group?')) return;

        try {
            await groupsAPI.leave(id);
            const response = await groupsAPI.getById(id);
            setGroup(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave group');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to DELETE this group? This action cannot be undone.')) return;

        try {
            await groupsAPI.delete(id);
            navigate('/groups');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete group');
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        setPosting(true);
        try {
            await groupsAPI.createPost(id, { content: newPost });
            const response = await groupsAPI.getById(id);
            setGroup(response.data);
            setNewPost('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post');
        }
        setPosting(false);
    };

    const handleGetInviteCode = async () => {
        try {
            const response = await groupsAPI.getInviteCode(id);
            setInviteCode(response.data.inviteCode);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get invite code');
        }
    };

    const openEditDialog = () => {
        setEditForm({
            name: group.name,
            description: group.description,
            private: group.private,
        });
        setShowEditDialog(true);
    };

    const handleUpdateGroup = async () => {
        try {
            await groupsAPI.update(id, editForm);
            const response = await groupsAPI.getById(id);
            setGroup(response.data);
            setShowEditDialog(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update group');
        }
    };

    const handleSendEmailInvite = async () => {
        if (!emailToInvite.trim()) {
            setInviteError('Please enter an email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToInvite)) {
            setInviteError('Please enter a valid email address');
            return;
        }

        setSendingInvite(true);
        setInviteError('');
        setInviteSuccess('');

        try {
            const response = await groupsAPI.sendInvite(id, emailToInvite.trim());
            setInviteSuccess(response.data.message || 'Invite sent successfully!');
            setEmailToInvite('');
        } catch (err) {
            setInviteError(err.response?.data?.message || 'Failed to send invite');
        }
        setSendingInvite(false);
    };

    const handleReply = async (postId) => {
        if (!replyContent.trim()) return;

        setReplying(true);
        try {
            await groupsAPI.replyToPost(id, postId, replyContent.trim());
            const response = await groupsAPI.getById(id);
            setGroup(response.data);
            setReplyContent('');
            setReplyingTo(null);
            // Auto-expand replies after posting
            setExpandedReplies(prev => ({ ...prev, [postId]: true }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reply');
        }
        setReplying(false);
    };

    const toggleReplies = (postId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !group) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/groups')} sx={{ mb: 2 }}>
                Back to Groups
            </Button>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Group Header */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h4" fontWeight="bold">
                                {group.name}
                            </Typography>
                            <Chip
                                icon={group.private ? <Lock fontSize="small" /> : <Public fontSize="small" />}
                                label={group.private ? 'Private' : 'Public'}
                                size="small"
                                color={group.private ? 'default' : 'success'}
                            />
                        </Box>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            {group.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={group.creator?.profilePicture} sx={{ width: 32, height: 32 }}>
                                {group.creator?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" color="text.secondary">
                                Created by <strong>{group.creator?.username}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {isMember ? (
                            <>
                                {isCreator && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            onClick={openEditDialog}
                                            startIcon={<Edit />}
                                        >
                                            Edit
                                        </Button>
                                        {group.private && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleGetInviteCode}
                                                    startIcon={<ContentCopy />}
                                                >
                                                    Invite Code
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => {
                                                        setShowEmailInviteDialog(true);
                                                        setEmailToInvite('');
                                                        setInviteError('');
                                                        setInviteSuccess('');
                                                    }}
                                                    startIcon={<Share />}
                                                >
                                                    Invite by Email
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={handleDelete}
                                            startIcon={<Delete />}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                                {!isCreator && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleLeave}
                                        startIcon={<ExitToApp />}
                                    >
                                        Leave
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleJoin}
                                disabled={joining}
                                startIcon={<People />}
                            >
                                {joining ? 'Joining...' : 'Join Group'}
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Invite Code Display */}
                {inviteCode && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Invite Code: <strong>{inviteCode}</strong>
                            <Tooltip title="Copy">
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        navigator.clipboard.writeText(inviteCode);
                                        alert('Copied!');
                                    }}
                                >
                                    <ContentCopy fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                    </Alert>
                )}

                {/* Members Section */}
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                            Members ({group.members?.length || 0})
                        </Typography>
                        {isMember && (
                            <Button size="small" onClick={() => setShowMembersDialog(true)}>
                                View All Members
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {group.members?.slice(0, 8).map((member) => (
                            <Tooltip key={member._id} title={member.username}>
                                <Chip
                                    avatar={<Avatar src={member.profilePicture}>{member.username?.charAt(0).toUpperCase()}</Avatar>}
                                    label={member.username}
                                    variant="outlined"
                                    size="small"
                                />
                            </Tooltip>
                        ))}
                        {group.members?.length > 8 && (
                            <Chip label={`+${group.members.length - 8} more`} size="small" onClick={() => setShowMembersDialog(true)} />
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Posts Section */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Group Posts
            </Typography>

            {isMember ? (
                <Paper component="form" onSubmit={handlePost} sx={{ p: 2, mb: 4 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Share something with the group..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={posting || !newPost.trim()}
                        endIcon={<Send />}
                    >
                        Post
                    </Button>
                </Paper>
            ) : (
                <Alert severity="info" sx={{ mb: 4 }}>
                    Join this group to post and interact with members.
                </Alert>
            )}

            {/* Posts List - Chat Style */}
            <Paper sx={{
                maxHeight: '500px',
                overflowY: 'auto',
                background: 'linear-gradient(135deg, #ff5858 0%, #87CEEB 100%)',
                p: 2,
                borderRadius: 2,
                mb: 4,
                width: '75%',
            }}>
                {group.posts?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[...group.posts].reverse().map((post) => (
                            <Box key={post._id} sx={{ display: 'flex', gap: 2 }}>
                                <Avatar
                                    src={post.author?.profilePicture}
                                    sx={{ width: 40, height: 40, mt: 0.5 }}
                                >
                                    {post.author?.username?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    {/* Main message bubble */}
                                    <Paper sx={{
                                        p: 2,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: 1
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography fontWeight="bold" color="primary">
                                                {post.author?.username}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(post.timestamp)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {post.content}
                                        </Typography>

                                        {/* Action buttons */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                            {isMember && (
                                                <Button
                                                    size="small"
                                                    startIcon={<Reply />}
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === post._id ? null : post._id);
                                                        setReplyContent('');
                                                    }}
                                                    color={replyingTo === post._id ? 'primary' : 'inherit'}
                                                >
                                                    Reply
                                                </Button>
                                            )}
                                            {post.replies?.length > 0 && (
                                                <Button
                                                    size="small"
                                                    onClick={() => toggleReplies(post._id)}
                                                    endIcon={expandedReplies[post._id] ? <ExpandLess /> : <ExpandMore />}
                                                    color="inherit"
                                                >
                                                    {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                                                </Button>
                                            )}
                                        </Box>
                                    </Paper>

                                    {/* Reply input */}
                                    {replyingTo === post._id && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, pl: 2 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Write a reply..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                disabled={replying}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleReply(post._id);
                                                    }
                                                }}
                                            />
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleReply(post._id)}
                                                disabled={!replyContent.trim() || replying}
                                            >
                                                {replying ? <CircularProgress size={20} /> : <Send />}
                                            </IconButton>
                                        </Box>
                                    )}

                                    {/* Replies thread */}
                                    {expandedReplies[post._id] && post.replies?.length > 0 && (
                                        <Box sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                                            {post.replies.map((reply, replyIndex) => (
                                                <Box key={replyIndex} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                                                    <Avatar
                                                        src={reply.author?.profilePicture}
                                                        sx={{ width: 28, height: 28 }}
                                                    >
                                                        {reply.author?.username?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Paper sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1.5, flex: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                            <Typography variant="body2" fontWeight="bold" color="primary.dark">
                                                                {reply.author?.username}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatDate(reply.timestamp)}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                            {reply.content}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No posts yet. Be the first to share something!
                    </Typography>
                )}
            </Paper>

            {/* Invite Code Dialog */}
            <Dialog open={showInviteDialog} onClose={() => setShowInviteDialog(false)}>
                <DialogTitle>Enter Invite Code</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This is a private group. You need an invite code to join.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Invite Code"
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowInviteDialog(false)}>Cancel</Button>
                    <Button onClick={handleJoin} variant="contained" disabled={!inviteInput}>
                        Join
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Group Dialog */}
            <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Group</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Group Name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={editForm.private}
                                onChange={(e) => setEditForm({ ...editForm, private: e.target.checked })}
                            />
                        }
                        label={editForm.private ? 'Private (requires invite code)' : 'Public (anyone can join)'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateGroup} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Members Dialog */}
            <Dialog open={showMembersDialog} onClose={() => setShowMembersDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Group Members ({group?.members?.length || 0})</DialogTitle>
                <DialogContent>
                    <List>
                        {group?.members?.map((member) => (
                            <ListItem key={member._id}>
                                <ListItemAvatar>
                                    <Avatar src={member.profilePicture}>
                                        {member.username?.charAt(0).toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={member.username}
                                    secondary={member._id === group.creator?._id ? 'Creator' : 'Member'}
                                />
                                {member._id === group.creator?._id && (
                                    <Chip label="Creator" size="small" color="primary" />
                                )}
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowMembersDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Email Invite Dialog */}
            <Dialog open={showEmailInviteDialog} onClose={() => setShowEmailInviteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Share />
                        Invite by Email
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Send an invitation to join <strong>"{group?.name}"</strong> to a registered user by their email address.
                    </Typography>

                    {inviteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {inviteError}
                        </Alert>
                    )}

                    {inviteSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {inviteSuccess}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Email Address"
                        placeholder="Enter user's email"
                        type="email"
                        value={emailToInvite}
                        onChange={(e) => setEmailToInvite(e.target.value)}
                        sx={{ mt: 1 }}
                        autoFocus
                        disabled={sendingInvite}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendEmailInvite();
                            }
                        }}
                    />

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Note: The user must have a registered account with this email address.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEmailInviteDialog(false)} disabled={sendingInvite}>
                        Close
                    </Button>
                    <Button
                        onClick={handleSendEmailInvite}
                        variant="contained"
                        disabled={!emailToInvite.trim() || sendingInvite}
                        startIcon={sendingInvite ? <CircularProgress size={16} /> : <Send />}
                    >
                        {sendingInvite ? 'Sending...' : 'Send Invite'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
