import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    // Ye token 30 din tak valid rahega
    return jwt.sign({ id }, process.env.JWT_TOKEN, {
        expiresIn: '30d', 
    });
};

export default generateToken;