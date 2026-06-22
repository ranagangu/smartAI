const jwt = require('jsonwebtoken');
const { UserRepository } = require('../models/repositories');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    let secret = process.env.JWT_SECRET || 'smart_interview_jwt_secret';
    secret = secret.replace(/^['"]|['"]$/g, '');
    const decoded = jwt.verify(token, secret);
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User associated with this token not found.' });
    }

    // Attach user record to request
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

module.exports = authMiddleware;
