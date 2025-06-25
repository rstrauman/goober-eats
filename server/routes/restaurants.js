const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../../data/restaurants.json');

// GET /api/restaurants - Load all restaurants from JSON
router.get('/', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });
    res.json(JSON.parse(data));
  });
});

// GET /api/restaurants/:id - Get one restaurant by ID
router.get('/:id', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    const restaurants = JSON.parse(data);
    const id = parseInt(req.params.id);
    const restaurant = restaurants.find(r => r.id === id);

    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ error: 'Restaurant not found' });
    }
  });
});

module.exports = router;

router.get('/:id/menu', (req, res) => {
  const menusPath = path.join(__dirname, '../../Data/menus.json');

  fs.readFile(menusPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load menu file' });

    const menus = JSON.parse(data);
    const menu = menus[req.params.id];

    if (menu) {
      res.json(menu);
    } else {
      res.status(404).json({ error: 'Menu not found' });
    }
  });
});


