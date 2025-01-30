import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nikhil_pantham';

export const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: "error", 
        message: "No token provided" 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      status: "error", 
      message: "Invalid token" 
    });
  }
};