const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication' });
  }
};

module.exports = adminAuth;