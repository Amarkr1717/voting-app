const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

//pre-save hook to hash password before saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    try{
        //hash password generation 
        const salt = await bcrypt.genSalt(10);

        //hash the password
        const hashedPassword = await bcrypt.hash(this.password, salt);

        //replace plain password with hashed password
        this.password = hashedPassword;
        next();
    }
    catch(error){
        return next(error);
    }
})

userSchema.methods.comparePassword = async function (candidatePassword){
    try{
        //use bcrypt to compare passwords
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }
    catch(error){
        throw error;
    }
}

const User = mongoose.model('user',userSchema);

module.exports = User;