const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

//post route to add a person
router.post('/signup',async(req, res) => {
    try{
        const data = req.body; //assuming the body contians the person data

        //Create a new user document using the mongoose model
        const newUser = new User(data);

        //save the new user to the database;
        const response = await newUser.save();
        console.log('data saved');
         
         //payload helps in generating token
         const payload = {   
            id: response._id,
         }
         console.log(JSON.stringify(payload));

         const token  = generateToken(payload);
         console.log("Token is: ",token);

         res.status(200).json({response:response, token: token});    
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

//login route
router.post('/login', async(req, ress)=> {
    try{
        const {aadharNumber, password} = req.body;

        const user = await User.findOne({aadharNumber: aadharNumber});

        if(!user || (!await user.comparePassword(password))){
            return res.status(401).json({message: 'Invalid username or password'});
        }

        const payload = {
            id: user._id,
        }

        const token = generateToken(payload);

        res.json({token});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

//profile route
router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try{
        const userData = req.user;
        //console.log("user data: ", userData);

       const userId = userData.id;
       const user = await User.findById(userId);
       res.status(200).json({user});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
})

router.put('/profile/password', jwtAuthMiddleware, async(req, res) => {
    try{
        const userId = req.user.id;
        const {oldPassword, newPassword} = req.body;

        //find the user by userId
        const user = await User.findById(userId);

         if((!await user.comparePassword(password))){
            return res.status(401).json({message: 'Invalid username or password'});
        }

        //update the user password
        user.password = newPassword;
        await user.save();

        console.log("password changed");
        res.status(200).json({message: 'Password updated successfully'});  
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
})

module.exports = router;