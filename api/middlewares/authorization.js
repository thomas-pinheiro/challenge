export const checkAuthorization = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Token is missing in Authorization header' });
    }

    req.token = authHeader;
    next();
};