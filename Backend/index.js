// importing all the packages:
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const ip = require("ip");
require("dotenv").config();

// express app initialized and port assigned:
const app = express();
const port = 3000;
// enabling cors and parsing:
app.use(cors());
app.use(bodyParser.json());

// finding the ip address for locally running:
const ipAddress = ip.address();

// server initialized:
const server = app.listen(port, (req, res) => {
    console.log(`Server is running on ${ipAddress}:${port}`);
});

// MongoDB connected:
const passDb = process.env.passwordOfDatabase;
mongoose.connect(`mongodb+srv://raza:${passDb}@cluster0.euagu12.mongodb.net/`, {}).then(() => {
    console.log("Database connected successfully!");
}).catch((err) => {
    console.log(`Error in connecting to DB : ${err}`);
});

// Importing Models:
const User = require("./Models/user");
const Blog = require("./Models/Blog");

// Multer Setup 
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Token Creation Function:
const createToken = (userId) => {
    const payload = {
        userId: userId
    };
    const token = jwt.sign(payload, "KeyRandom", { expiresIn: "1h" });
    return token;
}

//Api:

// endpoint for Sign Up:
app.post("/register", upload.single('image'), async (req, res) => {
    const { username, email, password } = req.body;
    const { buffer, mimetype } = req.file;
    try {

        const newUser = new User({
            name: username,
            email: email,
            password: password,
            image: {
                name: `${uuidv4()}.${mimetype.split('/')[1]}`,
                data: buffer,
                contentType: mimetype
            }
        });
        await newUser.save();
        return res.status(200).json({ message: "Sign Up Successful!" });
    } catch (err) {
        console.log("Error in Signing Up:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// endpoint for Login:
app.post("/login", (req, res) => {
    const { username, pass } = req.body;

    User.findOne({ name: username }).then((user) => {
        console.log("1");
        if (!user) {
            console.log("2");
            return res.status(404).json({ message: "user not found " })
        }

        if (user.password != pass) {
            console.log("3");
            return res.status(404).json({ message: "Password is Invalid" })
        }
        const token = createToken(user._id);
        console.log("login successful");
        return res.status(200).json({ token: token });
    }).catch((err) => {
        console.log("Error while finding the user", err);
        return res.status(500).json({ message: "Some Error Occured" });
    })
})

// api endpoint for Verification Screen:
app.post("/verification/:userId", upload.single("image"), async (req, res) => {
    const userId = req.params.userId;
    const { flag } = req.body;
    const { buffer, mimetype } = req.file;
    console.log("entered");
    try {
        await User.findByIdAndUpdate(userId, {
            $set: {
                imageVerify: {
                    name: `${uuidv4()}.${mimetype.split('/')[1]}`,
                    data: buffer,
                    contentType: mimetype
                }
            }
        })
        await User.findByIdAndUpdate(userId, {
            $set: {
                sentVerificationImage: true
            }
        })
        console.log("added and set true");
        return res.status(200).json({ message: "Image Uploaded on DB For Verification" });
    }
    catch (err) {
        console.log("error in uploading the image to the DB for Verification: ", err);
        return res.status(500).json({ message: "Error in uploading the image to database" })
    }
})

// endpoint for checking if verification image uploaded
app.get("/hasSent/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById({ _id: userId });
        return res.status(200).json({ sentVerificationImage: user.sentVerificationImage, profileBuilt: user.profileBuilt });
    }
    catch (err) {
        console.log("error in getting the sentVerificationImage:", err);
        return res.status(500).json({ message: "error in getting the sentVerificationImage" });
    }
})

// api endpoint for handling profile details postReq:
app.post("/profileData/:userId", async (req, res) => {
    const { userId } = req.params;
    const { emergencyPhone1, emergencyPhone2, pregnancyStatus, birthPlan, numBabies, dueDate, profileBuilt } = req.body;
    try {
        await User.findByIdAndUpdate(userId, {
            $set: {
                emergencyPhone1, emergencyPhone2, pregnancyStatus, birthPlan, numBabies, dueDate, profileBuilt
            }
        })
        console.log("Profile Details Sent Successfully");
        return res.status(200).json({ message: "Profile Details Sent Successfully" });
    }
    catch (err) {
        console.log("error in sending profile data:", err);
        return res.status(500).json({ message: "error in sending profile details" })
    }
})

// api endpoint for fetching userData:
app.get("/getUserData/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        return res.status(200).json({ username: user.name, userImage: user.image });
    }
    catch (err) {
        console.log("error in getting user data: ", err);
        return res.status(500).json({ message: "error in getting user data" });
    }
})

// fetch images:
app.get('/images/:name', async (req, res) => {
    const { name } = req.params;
    try {
        // Find user with matching image name
        const user = await User.findOne({ 'image.name': name });
        if (!user || !user.image) {
            return res.status(404).json({ success: false, message: 'Image not found.' });
        }

        // Set content type and send image data
        res.set('Content-Type', user.image.contentType);
        res.send(user.image.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch image.' });
    }
});

// api endpoint for fetching blogs:
app.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find({});
        return res.status(200).json({ blogs });
    }
    catch (err) {
        console.log("error in retrieving the blogs:", err);
        return res.status(500).json({ message: "error in retrieving the blogs" });
    }
})

// api endpoints for posting blog:
app