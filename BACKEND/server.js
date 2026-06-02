const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Serve static files (uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/uploads', require('./routes/upload.routes'));
app.use('/api/categories', require('./routes/category.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Rwanda Papers API is running' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(require('./middleware/error.middleware'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});
