require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database helper
const getApps = () => {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'apps.json'), 'utf-8');
    return JSON.parse(data);
};

// --- APIs ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "Server is responsive", time: new Date() });
});

// Fetch all apps or filter by category
app.get('/api/apps', (req, res) => {
    try {
        const { category } = req.query;
        let apps = getApps();
        
        if (category && category !== 'all') {
            apps = apps.filter(a => a.category === category);
        }
        
        res.json(apps);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch apps" });
    }
});

// Search apps
app.get('/api/apps/search', (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json(getApps());

        const query = q.toLowerCase();
        const apps = getApps().filter(a => 
            a.name.toLowerCase().includes(query) || 
            a.desc.toLowerCase().includes(query)
        );
        
        res.json(apps);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

// Mock Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Simple check (mock credentials)
    if (email === 'user@example.com' && password === 'password123') {
        res.json({ success: true, user: { name: "Media Hub User", email } });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
