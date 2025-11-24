const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate');

const checkAdminRole = async(userID) => {
    try{
        const user = await User.findById(userID);
        return user.role === 'admin';
    }
    catch(error){
        throw error;
    }
}

//post route to add a candidate
router.post('/',jwtAuthMiddleware, async(req, res) => {
    try{
   
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'Access denied. Admins only.'});
        }

        const data = req.body; //assuming the body contians the candidate data

        //Create a new candidate document using the mongoose model
        const newCandidate = new Candidate(data);

        //save the new user to the database;
        const response = await newCandidate.save();
        console.log('data saved');
         
         //payload helps in generating token
         const payload = {   
            id: response._id,
         }
         console.log(JSON.stringify(payload));

         const token  = generateToken(payload);
         console.log("Token is: ",token);

         res.status(200).json({response:response});    
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

// //login route
// router.post('/login', async(req, ress)=> {
//     try{
//         const {aadharNumber, password} = req.body;

//         const user = await User.findOne({aadharNumber: aadharNumber});

//         if(!user || (!await user.comparePassword(password))){
//             return res.status(401).json({message: 'Invalid username or password'});
//         }

//         const payload = {
//             id: user._id,
//         }

//         const token = generateToken(payload);

//         res.json({token});
//     }
//     catch(error){
//         console.log(error);
//         res.status(500).json({message: 'Internal server error'});
//     }
// });

router.put('/candidateID', jwtAuthMiddleware, async(req, res) => {
    try{


         if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'Access denied. Admins only.'});
        }

        const candiadteID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candiadteID, updatedCandidateData, {
            new: true,            //return the updated document
            runValidators: true   //run mangoose validation on update
        });

        if(!response){
            return res.status(404).json({message: 'Candidate not found'});
        }
        console.log('Candidate updated successfully');
        res.status(200).json({response});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }

})

router.delete('/candidateID', jwtAuthMiddleware, async(req, res) => {
    try{


         if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'Access denied. Admins only.'});
        }

        const candiadteID = req.params.candidateID;
        //const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndDelete(candiadteID);

        if(!response){
            return res.status(404).json({message: 'Candidate not found'});
        }
        console.log('Candidate deleted successfully');
        res.status(200).json({message: 'Candidate deleted successfully' });
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }

})

//lets start voting
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=> {
    //no admin can vote
    //user can vote only once
    
    candidateID = req.params.candidateID;
    userID = req.user.id;

    try{

        //find the candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'});
        }

        //find the user document with the specified userID
        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        if(user.isVoted){
            return res.status(400).json({message: 'User has already voted'});   
        }

        if(user.role === 'admin'){
            return res.status(403).json({message: 'Admins are not allowed to vote'});
        }

        //increment the vote count of the candidate by 1
        candidate.votes.push({userID: userID});
        candidate.voteCount += 1;
        await candidate.save();

        //update the user document to indicate that the user has voted
        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'Vote cast successfully'});

    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
});

//voteCount
router.get('/vote/count', async(req, res) => {
    try{
        const candidates = await Candidate.find().sort({voteCount: 'desc'});

        //map the candidates to return only relevant information
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                voteCount: data.voteCount
            };
        });
        res.status(200).json({voteRecord});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
})

module.exports = router;