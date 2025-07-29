const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if(!token) {
        return res.status(401).json({success: false, message: 'No token provided'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            return res.status(401).json({success: false, message: 'Invalid token'});
        }
        // Attach the decoded user payload ({ userId: '...' }) to the request object
        req.user = decoded;
        next();
    })
}
module.exports = {verifyToken};