import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        message: 'Invalid authorization format',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Authentication error:', error);

    return res.status(401).json({
      status: false,
      message: 'Invalid or expired token',
    });
  }
}

export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], env.JWT.SECRET);
  } catch {
    req.user = undefined;
  }
  next();
}

export function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      status: false,
      message: 'Admin access required',
    });
  }
  next();
}
