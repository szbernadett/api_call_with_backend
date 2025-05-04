// Add this line with your other route imports
const adminRoutes = require('./routes/admin');

// Add this line with your other app.use statements
app.use('/api/admin', adminRoutes);