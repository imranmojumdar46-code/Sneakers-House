const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/payment-info', orderController.paymentInfo);
router.post('/checkout', orderController.checkout);
router.get('/my', orderController.myOrders);
router.get('/admin/all', orderController.adminAll);
router.put('/:id/status', orderController.adminUpdate);
router.get('/:id', orderController.orderDetail);

module.exports = router;
