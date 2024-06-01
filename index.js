const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhmvsbs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //commit this line when deploy on vercel -- start
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    //commit this line when deploy on vercel -- end

    const mealDB = client.db("mealDB");
    const userCollection = mealDB.collection("users");
    const mealCollection = mealDB.collection("meals");

    //admin middleware
    const verifyAdmin = async (req, res, next) => {
      const { email } = req.user;
      const query = { email };
      const userData = await userCollection.findOne(query);
      if (userData.role !== "admin") {
        return res.status(403).send({ message: "forbidden access 44" });
      }
      next();
    };

    //jwt middleware
    const verifyToken = (req, res, next) => {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).send({ message: "unauthorized access 49" });
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          console.log("err 56");

          return res.status(401).send({ message: "unauthorized access 55" });
        }
        req.user = { email: decoded };
        next();
      });
    };

    //jwt routes -- start

    //creating Token
    app.post("/jwt", async (req, res) => {
      const { email } = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      res.send({ token });
    });

    //jwt routes -- end

    // user related api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ success: true });
      }
      const result = await userCollection.insertOne(user);
      res.send({ success: true });
    });

    // admin related api
    app.get("/users/admin", verifyToken, async (req, res) => {
      const { email } = req.user;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ admin: user?.role === "admin" });
    });

    app.post("/meals", verifyToken, verifyAdmin, async (req, res) => {
      const meal = req.body;
      const result = await mealCollection.insertOne(meal);
      res.send(result);
    });

    app.get("/meals", verifyToken, verifyAdmin, async (req, res) => {
      const result = await mealCollection.find().toArray();
      res.send(result);
    });

    app.delete("/meals/:id", verifyToken, verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await mealCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
