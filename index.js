const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SK_KEY);
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
    const paymentCollection = mealDB.collection("payments");

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
    app.get(
      "/users/suggestions",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const { query } = req.query;
          const suggestions = await userCollection
            .find(
              {
                $or: [
                  { username: { $regex: query, $options: "i" } },
                  { email: { $regex: query, $options: "i" } },
                ],
              },
              {
                limit: 10,
              }
            )
            .toArray();

          res.send(suggestions);
        } catch (err) {
          res.status(500).send({ err });
        }
      }
    );

    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const { query } = req.query;
      let result = [];
      if (query) {
        result = await userCollection
          .find({
            $or: [
              { username: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
            ],
          })
          .toArray();
      } else {
        result = await userCollection.find().toArray();
      }
      res.send(result);
    });

    app.get("/users/profile", verifyToken, async (req, res) => {
      const query = { email: req.user.email };
      const result = await userCollection.findOne(query);
      const mealCount = await mealCollection.countDocuments(query);
      result.mealCount = mealCount;
      res.send(result);
    });

    app.get("/users/admin", verifyToken, async (req, res) => {
      const { email } = req.user;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ admin: user?.role === "admin" });
    });

    app.put(
      "/users/admin/:email",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const { email } = req.params;
        const query = { email };
        const result = await userCollection.updateOne(query, {
          $set: { role: "admin" },
        });
        res.send(result);
      }
    );

    app.post("/meals", verifyToken, verifyAdmin, async (req, res) => {
      const meal = req.body;
      const result = await mealCollection.insertOne(meal);
      res.send(result);
    });

    app.get("/meals", verifyToken, verifyAdmin, async (req, res) => {
      const sort = {};
      if (req.query.sort === "likes") {
        sort.likes = -1;
      } else if ((req.query.sort = "reviews")) {
        sort.reviewsCount = -1;
      }
      const result = await mealCollection
        .aggregate([
          {
            $addFields: {
              reviewsCount: { $size: "$reviews" }, // Add a field for reviews count
            },
          },
          {
            $sort: sort, // Sort by the specified criteria
          },
        ])
        .toArray();
      res.send(result);
    });

    app.get("/meals/category/:category", async (req, res) => {
      const { category } = req.params;
      let query = {};
      if (category !== "All") {
        query = { category };
      }
      const result = await mealCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/meals/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await mealCollection.findOne(query, {
        projection: {
          _id: 0,
        },
      });
      res.send(result);
    });

    app.put("/meals/:id/like", verifyToken, async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const update = {
        $inc: { likes: 1 },
      };
      const result = await mealCollection.updateOne(query, update);
      res.send(result);
    });

    app.put("/meals/:id", verifyToken, verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const meal = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedMeal = {
        $set: meal,
      };
      const result = await mealCollection.updateOne(query, updatedMeal);
      res.send(result);
    });

    app.put("/meals/:id/review", verifyToken, async (req, res) => {
      const { id } = req.params;
      const { review } = req.body;
      const { email } = req.user;
      const query = { _id: new ObjectId(id) };
      const meal = await mealCollection.findOne(query);

      const existingReviewIndex = meal.reviews.findIndex(
        (meal) => meal.email === email
      );

      if (existingReviewIndex !== -1) {
        // Update the existing review
        meal.reviews[existingReviewIndex] = { email, review };
      } else {
        // Add the new review
        meal.reviews.push({ email, review });
      }
      const updatedMeal = {
        ...meal,
        reviews: meal.reviews,
      };
      const result = await mealCollection.updateOne(query, {
        $set: updatedMeal,
      });
      res.send(result);
    });

    app.delete("/meals/:id", verifyToken, verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await mealCollection.deleteOne(filter);
      res.send(result);
    });

    // payment related api
    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      const { price } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: +price,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", verifyToken, async (req, res) => {
      const payment = req.body;
      const filter = { email: req.user.email };
      const result = await paymentCollection.insertOne(payment);
      const result2 = await userCollection.updateOne(filter, {
        $set: {
          badge: payment.badge,
        },
      });
      res.send({ result, result2 });
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
