const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());
const product = [{ name: "alu" }];

//routes
// const firebaseAdminRoute = require("./firebase/firebase.admin");

// // Firebase admin sdk

// app.use("/firebase", firebaseAdminRoute);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ouw6pvz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const productsCollection = client.db("e-commerce").collection("products");
    const orderCollection = client.db("e-commerce").collection("orders");
    const usersCollection = client.db("e-commerce").collection("users");
    const customerCollection = client.db("e-commerce").collection("customer");
    // jwt token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    });
    // products api
    app.get("/allProducts", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const service = await cursor.toArray();
      res.send(service);
    });
    app.post("/allProducts", async (req, res) => {
      const query = {};
      const result = await productsCollection.insertOne(product);
      console.log(result);
      res.send(result);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // orders api and use jwt token
    app.get("/orders", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/orderList", async (req, res) => {
      const query = {};
      const cursor = await orderCollection.find(query).toArray();
      res.send(cursor);
    });

    //customer API
    app.put("/customers", async (req, res) => {
      const customer = req.body;
      const result = await customerCollection.insertOne(customer);
      res.send(result);
    });

    app.get("/customers", async (req, res) => {
      const query = {};
      const cursor = customerCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //post api create for user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    //get api for all user
    app.get("/users", async (req, res) => {
      let query = {};
      if (req.query.role) {
        query = {
          role: req.query.role,
        };
      }
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", async (req, res) => {
  res.send("e-commerce Server is running fine");
});

app.listen(port, () => {
  console.log(`running fine on port ${port}`);
});
