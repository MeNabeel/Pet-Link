const express = require('express');
const router = express.Router();
const { 
  getProducts, getProductById, createProduct, updateProduct, duplicateProduct, deleteProduct, bulkProductAction 
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.post('/:id/duplicate', duplicateProduct);
router.delete('/:id', deleteProduct);
router.post('/bulk', bulkProductAction);

module.exports = router;
