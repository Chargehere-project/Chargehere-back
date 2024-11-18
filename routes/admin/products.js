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
    deleteImageUrlInDB,
} = require('../../controller/admin/ProductController');

const upload = require('../../middleware/upload'); 

router.get('/', verifyToken, getProducts);
router.post('/', verifyToken, upload.single('thumbnail'), createProduct);
router.put('/:productId', verifyToken, upload.single('thumbnail'), editProduct);
router.delete('/:productId', verifyToken, deleteProduct);
router.put('/:productId/status', verifyToken, updateProductStatus);
router.delete('/:productId/thumbnail', verifyToken, deleteProductImage);
router.get('/search', verifyToken, searchProducts);
router.put('/:productId/remove-image', deleteImageUrlInDB);

module.exports = router;
