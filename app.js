const connetToMongo = require('./dataBase');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const Bday = require('./models/Bday');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'ABCDEFGHIGKLMNOPQRSTUWXYZ';
const fetchuser = require('./middleware/fetchUser')
const schedule = require('node-schedule');
connetToMongo();
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// const accountSid = 'AC009df215df394c2795026d805d3d4177';
// const authToken = '8e5faddee8cf5e1944da5238efb185e5';
// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         body: 'Your appointment is coming up on July 21 at 3PM',
//         from: 'whatsapp:+14155238886',
//         to: 'whatsapp:+917489148585'
//     })
//     .then(message => console.log(message.sid))

//Create User using POST "/api/auth/signup"
app.post('/api/auth/signup',[
  body('name', "Enter a valid name").isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
],async (req, res) => {
  const errors = validationResult(req);
  //if there are error
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    //Check whether the email exists already  
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
      phone:req.body.phone
    })
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);

    res.status(201).json({success:true,authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured")
  }

})

//Login a User using: POST "/api/auth/login" ->no authenticaton required
app.post('/api/auth/login', [
  body('email').isEmail()
], async (req, res) => {
  //if there are error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Sorry invalid credentials"
      })
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({
        error: "Sorry invalid credentials"
      })
    }
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.status(201).json({success:true,authtoken});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured")
  }

})


app.post("/api/add",fetchuser,async(req,res)=>{
   try{
    const {name,phone,Dob} = req.body;
    const bday = new Bday({
        name,phone,Dob      
   })
  const bdayEvent = await bday.save();
    res.status(201).json({
        success:true,
        bdayEvent
    })
  }catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured")
  }
})

const birthdayWish=async()=>{
    console.log('I ran....');
    const allBdays = await User.find({Dob:"17/7/2023"});
    console.log(allBdays,"user");
}

schedule.scheduleJob('* * * * *',()=>{
    const date = new Date();
    birthdayWish();
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 4000;
}

app.listen(port);