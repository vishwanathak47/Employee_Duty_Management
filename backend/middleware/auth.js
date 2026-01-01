const jwt = require('jsonwebtoken');
const Supervisor = require('../models/Supervisor');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supervisor = await Supervisor.findById(decoded.id);

    if (!supervisor) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.supervisor = supervisor;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;