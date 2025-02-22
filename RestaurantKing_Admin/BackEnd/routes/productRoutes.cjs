const express = require('express');
const router = express.Router();
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  changeProductStatus,
} = require('../controllers/productController.cjs');

router.post('/addProduct', addProduct);
router.get('/getProducts', getProducts);
router.get('/product/:id', getProductById);
router.put('/updateProduct/:id', updateProduct);
router.put('/changeProductStatus/:id', changeProductStatus);

module.exports = router;
