import { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Rating,
    Paper,
    TextField,
    Button,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI } from '../services/api';

export default function ReviewList({ reviews, targetModel, targetId, onReviewAdded, onReviewUpdated, onReviewDeleted }) {
    const { isAuthenticated, user } = useAuth();
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', tags: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [editingReview, setEditingReview] = useState(null);
    const [editForm, setEditForm] = useState({ rating: 5, comment: '', tags: '' });
    const [showEditDialog, setShowEditDialog] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) {
            setError('Please enter a comment');
            return;
        }
        if (!newReview.rating) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const tagsArray = newReview.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t);

            const response = await reviewsAPI.create({
                targetModel,
                targetId,
                rating: newReview.rating,
                comment: newReview.comment,
                tags: tagsArray,
            });

            setNewReview({ rating: 5, comment: '', tags: '' });
            if (onReviewAdded) onReviewAdded(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting review');
        }
        setSubmitting(false);
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setEditForm({
            rating: review.rating,
            comment: review.comment,
            tags: review.tags?.join(', ') || '',
        });
        setShowEditDialog(true);
    };

    const handleEditSubmit = async () => {
        if (!editForm.comment.trim()) {
            setError('Please enter a comment');
            return;
        }

        try {
            const tagsArray = editForm.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t);

            const response = await reviewsAPI.update(editingReview._id, {
                rating: editForm.rating,
                comment: editForm.comment,
                tags: tagsArray,
            });

            setShowEditDialog(false);
            setEditingReview(null);
            if (onReviewUpdated) onReviewUpdated(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating review');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await reviewsAPI.delete(reviewId);
            if (onReviewDeleted) onReviewDeleted(reviewId);
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting review');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                    Reviews ({reviews.length})
                </Typography>
                {reviews.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={parseFloat(averageRating)} precision={0.1} readOnly />
                        <Typography variant="h6" fontWeight="bold">{averageRating}</Typography>
                    </Box>
                )}
            </Box>

            {/* Add Review Form */}
            {isAuthenticated ? (
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Write a Review
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: 2 }}>
                            <Typography component="legend">
                                Your Rating <span style={{ color: 'red' }}>*</span>
                            </Typography>
                            <Rating
                                value={newReview.rating}
                                onChange={(e, value) => setNewReview({ ...newReview, rating: value })}
                                size="large"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Your Review"
                            required
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            sx={{ mb: 2 }}
                            helperText="Share your experience with this destination"
                        />
                        <TextField
                            fullWidth
                            label="Tags (comma separated)"
                            placeholder="e.g., beach, family-friendly, adventure"
                            value={newReview.tags}
                            onChange={(e) => setNewReview({ ...newReview, tags: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={20} /> : null}
                        >
                            Submit Review
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <Alert severity="info" sx={{ mb: 4 }}>
                    Please login to leave a review
                </Alert>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No reviews yet. Be the first to review!
                </Typography>
            ) : (
                reviews.map((review, index) => (
                    <Box key={review._id}>
                        <Box sx={{ display: 'flex', gap: 2, py: 3 }}>
                            <Avatar src={review.user?.profilePicture}>
                                {review.user?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography fontWeight="medium">
                                        {review.user?.username}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(review.createdAt)}
                                        </Typography>
                                        {user?._id === review.user?._id && (
                                            <>
                                                <IconButton size="small" onClick={() => handleEditClick(review)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(review._id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                                <Rating value={review.rating} size="small" readOnly sx={{ mb: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {review.comment}
                                </Typography>
                                {review.tags?.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {review.tags.map((tag, i) => (
                                            <Chip key={i} label={tag} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        {index < reviews.length - 1 && <Divider />}
                    </Box>
                ))
            )}

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Review</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography component="legend">
                            Your Rating <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Rating
                            value={editForm.rating}
                            onChange={(e, value) => setEditForm({ ...editForm, rating: value })}
                            size="large"
                            sx={{ mb: 2 }}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Your Review"
                        required
                        value={editForm.comment}
                        onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Tags (comma separated)"
                        value={editForm.tags}
                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
