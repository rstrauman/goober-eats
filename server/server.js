const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve your public folder (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// Serve the Images folder for your images
app.use('/Images', express.static(path.join(__dirname, '../Images')));

// Serve the Data folder for your JSON files
app.use('/Data', express.static(path.join(__dirname, '../Data')));

// Import route files
const restaurantsRouter = require('./routes/restaurants');
const ordersRouter = require('./routes/orders');

// Use routes with prefixes
app.use('/restaurants', restaurantsRouter);
app.use('/orders', ordersRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

