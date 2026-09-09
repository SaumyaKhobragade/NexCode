import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client;

async function connectClient() {
    if (!client) {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not set in environment");
        }
        client = new MongoClient(uri);
        await client.connect();
    }
    return client;
}

async function signup(req, res) {
    const { username, password, email } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        await connectClient();
        const db = client.db("NexCode");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: "Username already taken!" });
            }
            return res.status(400).json({ message: "Email already registered!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            starRepos: [],
            createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);
        const userId = result.insertedId;

        const token = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" },
        );
        res.json({ token, userId });
    } catch (err) {
        console.error("Error during signup : ", err);
        res.status(500).json({ message: err.message || "Server error" });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        await connectClient();
        const db = client.db("NexCode");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
        });
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Error during login : ", err);
        res.status(500).json({ message: err.message || "Server error!" });
    }
}

async function getAllUsers(req, res) {
    try {
        await connectClient();
        const db = client.db("NexCode");
        const usersCollection = db.collection("users");

        const users = await usersCollection.find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error("Error during fetching : ", err);
        res.status(500).json({ message: err.message || "Server error!" });
    }
}

async function getUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("NexCode");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({
            _id: new ObjectId(currentID),
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.send(user);
    } catch (err) {
        console.error("Error during fetching : ", err);
        res.status(500).json({ message: err.message || "Server error!" });
    }
}

async function updateUserProfile(req, res) {
    const currentID = req.params.id;
    const { email, password } = req.body;

    try {
        await connectClient();
        const db = client.db("NexCode");
        const usersCollection = db.collection("users");

        let updateFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        const result = await usersCollection.findOneAndUpdate(
            {
                _id: new ObjectId(currentID),
            },
            { $set: updateFields },
            { returnDocument: "after" },
        );
        const updatedDoc = result.value || result;
        if (!updatedDoc) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.send(updatedDoc);
    } catch (err) {
        console.error("Error during updating : ", err);
        res.status(500).json({ message: err.message || "Server error!" });
    }
}

async function deleteUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        await connectClient();
        const db = client.db("NexCode");
        const usersCollection = db.collection("users");

        const result = await usersCollection.deleteOne({
            _id: new ObjectId(currentID),
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.json({ message: "User Profile Deleted!" });
    } catch (err) {
        console.error("Error during updating : ", err);
        res.status(500).json({ message: err.message || "Server error!" });
    }
}

export default {
    signup,
    login,
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
};
