// routes/admin/products.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const verifyToken = require('../../middleware/verifyToken');
const {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
    updateProductStatus,
    deleteProductImage,
    searchProducts,
} = require('../../controller/admin/ProductController');

const upload = multer({ dest: 'uploads/' });

router.get('/', verifyToken, getProducts);
router.post('/', verifyToken, upload.single('thumbnail'), createProduct);
router.put('/:productId', verifyToken, upload.single('thumbnail'), editProduct);
router.delete('/:productId', verifyToken, deleteProduct);
router.put('/:productId/status', verifyToken, updateProductStatus);
router.delete('/:productId/thumbnail', verifyToken, deleteProductImage);
router.get('/search', verifyToken, searchProducts);

module.exports = router;
    