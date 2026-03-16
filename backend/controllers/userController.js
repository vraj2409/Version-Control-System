const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

var ObjectId = require('mongodb').ObjectId;

dotenv.config();
const uri = process.env.MONGODB_URI;

let client;
async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
}

async function signup(req, res) {
    const { name, email, password } = req.body;
    try {
        await connectClient();
        const db = client.db('vcs');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username: name,
            name,
            email,
            password: hashedPassword,
            repositories: [],
            followedUsers: [],
            starRepos: []
        };

        const result = await usersCollection.insertOne(newUser);
        const token = jwt.sign(
            { id: result.insertedId },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                _id: result.insertedId,
                name,
                email,
                repositories: [],
                followedUsers: [],
                starRepos: []
            }
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db('vcs');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                repositories: user.repositories,
                followedUsers: user.followedUsers,
                starRepos: user.starRepos
            },
            userId: user._id
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error!!" });
    }
}

async function getAllUsers(req, res) {
    try {
        await connectClient();
        const db = client.db('vcs');
        const usersCollection = db.collection('users');
        const users = await usersCollection.find({}).toArray();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getUserProfile(req, res) {
    const currentID = req.params.id;
    try {
        await connectClient();
        const db = client.db('vcs');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({
            _id: new ObjectId(currentID)
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function updateUserProfile(req, res) {
    const currentID = req.params.id;
    const { email, password } = req.body;
    try {
        let updateFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        await connectClient();
        const db = client.db('vcs');
        const usersCollection = db.collection('users');

        const result = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(currentID) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result);
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteUserProfile(req, res) {
    const currentID = req.params.id;
    try {
        await connectClient();
        const db = client.db('vcs');
        const usersCollection = db.collection('users');

        const result = await usersCollection.deleteOne({
            _id: new ObjectId(currentID)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getUserProfileFromToken(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.id;

        await connectClient();
        const db = client.db('vcs');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            repositories: user.repositories,
            followedUsers: user.followedUsers,
            starRepos: user.starRepos
        });
    } catch (error) {
        console.error("Error fetching user profile from token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    getUserProfileFromToken,
};