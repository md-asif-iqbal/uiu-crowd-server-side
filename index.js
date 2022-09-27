const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7wak6xy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// JWT Token here
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("user").collection("users");
    const helpCollection = client.db("user").collection("help");
    const workCollection = client.db("work").collection("ourwork");
    const upWorkCollection = client.db("work").collection("upcomingwork");
    const previousWorkCollection = client.db("work").collection("previouswork");
    const vlounteerCollection = client.db("user").collection("volunteer");
    const donationCollection = client.db("donation").collection("donations");
    const recentDoneatorCollection = client
      .db("donation")
      .collection("recentdonar");
    const loanCollection = client.db("loan").collection("requestloan");

    // User Access Token
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10h" }
      );
      res.send({ result, token });
    });
    // user get help
    app.post("/help", async (req, res) => {
      const query = req.body;
      const help = await helpCollection.insertOne(query);
      res.send(help);
    });

    // our work
    app.get("/ourwroks", async (req, res) => {
      const query = req.body;
      const room = await workCollection.find(query).toArray();
      res.send(room);
    });
    // Our previous work
    app.get("/previouswroks", async (req, res) => {
      const query = req.body;
      const room = await previousWorkCollection.find(query).toArray();
      res.send(room);
    });
    // recent Donate
    app.get("/recentDonator", async (req, res) => {
      const query = req.body;
      const room = await recentDoneatorCollection.find(query).toArray();
      res.send(room);
    });
    // upcoming work
    app.get("/upcomingwork", async (req, res) => {
      const query = req.body;
      const room = await upWorkCollection.find(query).toArray();
      res.send(room);
    });
    // vlounteer
    app.post("/vlounteer", async (req, res) => {
      const query = req.body;
      const reviews = await vlounteerCollection.insertOne(query);
      res.send(reviews);
    });
    // people donate
    app.post("/donations", async (req, res) => {
      const query = req.body;
      const donate = await donationCollection.insertOne(query);
      res.send(donate);
    });
    // people request for loan
    app.post("/requestloan", async (req, res) => {
      const query = req.body;
      const loan = await loanCollection.insertOne(query);
      res.send(loan);
    });

    app.get("/alldonates", async (req, res) => {
      const query = req.body;
      const donate = await donationCollection.find(query).toArray();
      res.send(donate);
    });
    app.get("/allloans", async (req, res) => {
      const query = req.body;
      const donate = await loanCollection.find(query).toArray();
      res.send(donate);
    });
    app.get("/allhelps", async (req, res) => {
      const query = req.body;
      const helps = await helpCollection.find(query).toArray();
      res.send(helps);
    });
  } finally {
  }
}

run().catch;
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
