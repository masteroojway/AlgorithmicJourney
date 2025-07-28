import { compare, genSalt, hash } from "bcrypt";
import User from "../userschema.js"
import jwt from "jsonwebtoken";


export async function getlogin(req, res) {
    try {
        const temp = await User.findOne({ email: req.body.email });
        if (!temp) {
            console.log("Could not find user");
            return res.status(404).send("User not found");
        }
        const isMatch = await compare(req.body.password, temp.password);
        if (!isMatch) {
            return res.status(401).send("Wrong password");
        }
        const token = jwt.sign({
            name: temp.name,
            email: temp.email,
            id: temp._id
        }, process.env.JWT_KEY, { expiresIn: "1h" });

        return res.status(200).json({ token });
    } catch (error) {
        console.error("Login error: ", error);
        return res.status(500).send("Internal server error");
    }
}

export async function register(req,res){
    const temp = await User.findOne({email: req.body.email});
    if(temp != null){
        return res.status(400).json({ message: "User already exists with this mail" });
    }
    try {
        const salt = await genSalt(10);
        const hashedPassword = await hash(req.body.password, salt);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        await newUser.save();
        res.status(201).send("Registration successfull");
    } catch (error) {
        console.log(error);
    }
}