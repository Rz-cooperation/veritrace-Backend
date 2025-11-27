import mongoose from 'mongoose';
const {Schema, model} = mongoose;


const locationSchema = new Schema({
    type:{
        type: String,
        enum: ["point"],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});


const AuthSchema = new Schema({
    companyName:{
        type: String,
        trim: true,
        required: true,
        minLength: [3, "Your Company's name cannot be less than 3!"]
    },
    password:{
        type: String,
        trim: true,
        required: true,
        minLength: [8, "Password has to be more than 8 characters"]
    },
    logo:{
        url: String,
        publicId: String,
        required: true
    },
    companyMail:{
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, "Email is invalid"]
    },
    companyAddress:{
        streetNo: String,
        addressStr: String,
        country: String,
        postalCode: String,
        location: locationSchema,
        required: true,
        unique: true
    },
    productDescription:{
        type: String,
        required: true,
        minLength: [10, "Describe your product in more than 10 words"]
    }
}, {timestamps: true});

const Auth = model('Auth', AuthSchema);
export default Auth;