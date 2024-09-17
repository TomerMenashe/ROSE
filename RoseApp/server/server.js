const express = require('express');
const cors = require('cors');

// Initialize the app
const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON

// Routes
const loginRoute = require('./routes/login'); // Example route
app.use('/login', loginRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
