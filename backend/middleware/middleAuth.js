import jwt from "jsonwebtoken";


export function requireAuth(req,res,next){
    const header = req.headers.authorization;
    if(!header || !header.startsWith("Bearer "))
    {
        return res.status(401).send("No token provided");
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).send("Invalid request");
    }
}