const express = require('express');
const router = express.Router();

// In-memory orders list (just for demo)
let orders = [];

// GET /orders - get all orders
router.get('/', (req, res) => {
  res.json(orders);
});

// POST /orders - create a new order
router.post('/', (req, res) => {
  const order = req.body;
  if (!order || !order.items || !Array.isArray(order.items)) {
    return res.status(400).json({ error: 'Invalid order format' });
  }
  order.id = orders.length + 1;
  orders.push(order);
  res.status(201).json(order);
});

module.exports = router;
