const User = require('../model/user');
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const handleLoginUser = async (req, res) => {
    const body = req.body;

    // Validate request body
    if (!body || !body.email || !body.password) {
        return res.status(400).json({ msg: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email: body.email });
    if (!user) {
        return res.status(400).json({ msg: "Email is not registered" });
    }

    // Check if password matches
    const isPasswordCorrect = await bcrypt.compare(body.password, user.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({ msg: "Password is incorrect" });
    }

    // Generate JWT token
    const token = jsonwebtoken.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: '1h', // Token expires in 1 hour (adjust as needed)
    });

    // Set token in HTTP-only cookie
    res.cookie('authToken', token, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === 'production',
        sameSite: 'None', // Lax or None depending on your setup
        path: '/', // Ensure the path is '/' to be accessible everywhere
        maxAge: 3600000,
    });

    // Send response
    return res.status(200).json({ msg: "Login successful", token: token, role: user.role });
};


const handleRegisterUser = async (req, res) => {
    const body = req.body;
    if (!body || !body.username || !body.email || !body.password) {
        return res.status(400).json({msg: "All fields are required"})
    }
    const bcryptPassword = await bcrypt.hash(body.password, 10);
    await User.create({
        username: body.username,
        email: body.email,
        password: bcryptPassword,
        outlet: body.outlet,
        role: body.outlet
    }).then((result)=> {
        return res.status(200).json({msg: "success", id: result._id})
    }).catch((err)=> {
        return res.status(400).json({msg: "failed", error: err.msg})
    })
}

const handleAuthentication = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.replace('Bearer ', '');
    //const token = req.cookies.authToken
    console.log('token',token)
    if(!token) {
        return res.status(401).json({msg: "token not found"})
    }
    try{

        const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY)
        console.log('Token is valid:', decoded.id);
        if (!decoded.id) {
            return res.status(401).json({msg: "token is not found"})
        }
        const checkUser = await User.findById(decoded.id);
        if(!checkUser) {
            return res.status(401).json({msg: "user not found"})
        }
        return res.status(200).json({msg: 'User is valid', role: checkUser.role})
    } catch(error) {
        return res.status(401).json({ message: 'Session expired, please log in again' });
    }
    
}

const handleLogout = async (req, res) => {
    console.log('token2',req.cookies.authToken)
    res.setHeader('Set-Cookie', 'authToken=; Max-Age=0; Path=/; HttpOnly;');
    res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = {handleLoginUser, handleRegisterUser, handleAuthentication, handleLogout}