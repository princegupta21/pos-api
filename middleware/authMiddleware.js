const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header or cookies
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1] || req.cookies.authToken;
    const token = req.cookies.authToken;
    // If no token is provided, return an error
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Store the decoded token in the request object
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = authenticateToken;
