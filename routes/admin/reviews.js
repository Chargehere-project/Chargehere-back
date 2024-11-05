// routes/admin/reviews.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const {
    getReviews,
    editReview,
    deleteReview,
    updateReviewStatus,
    deleteReviewImage,
    searchReviews,
} = require('../../controller/admin/ReviewController');

const upload = multer({ dest: 'uploads/' });

router.get('/', verifyToken, getReviews);
router.put('/:reviewId', verifyToken, upload.single('image'), editReview);
router.delete('/:reviewId', verifyToken, deleteReview);
router.put('/:reviewId/status', verifyToken, updateReviewStatus);
router.delete('/:reviewId/image', verifyToken, deleteReviewImage);
router.get('/search', verifyToken, searchReviews);

module.exports = router;
