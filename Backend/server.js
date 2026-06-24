// server.js - Put this file in your 'backend' folder

const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware (these help process requests)
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON data
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static files

// Simple storage (we'll use database later)
let bookings = [];
let partners = [];

// Routes (these handle different URLs)

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Handle booking form submissions
app.post('/api/bookings', (req, res) => {
    try {
        const booking = {
            id: Date.now(), // Simple ID for now
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        bookings.push(booking);
        
        console.log('New booking received:', booking);
        
        res.json({
            success: true,
            message: 'Booking received successfully!',
            bookingId: booking.id
        });
    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, something went wrong. Please try again.'
        });
    }
});

// Handle partner applications
app.post('/api/partners', (req, res) => {
    try {
        const partner = {
            id: Date.now(),
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        partners.push(partner);
        
        console.log('New partner application:', partner);
        
        res.json({
            success: true,
            message: 'Partner application received! We\'ll contact you soon.'
        });
    } catch (error) {
        console.error('Error processing partner application:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, something went wrong. Please try again.'
        });
    }
});

// Get all bookings (for admin later)
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// Get all partners (for admin later)
app.get('/api/partners', (req, res) => {
    res.json(partners);
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📝 You can view your website at the above URL`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n👋 Server shutting down...');
    process.exit(0);
});