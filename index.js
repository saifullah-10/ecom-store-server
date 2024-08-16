const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const PORT = process.env.PORT || 5000;

require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());
// routes

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kpsyb7k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// const database = client.db("scic-product");
// const products = database.collection("products");
// const productsOne = database.collection("productsone");

// Merge collections

async function run() {
  try {
    const products = client.db("scic-product").collection("products");
    const productsOne = client.db("scic-product").collection("productsone");

    // Perform a union of the two collections
    const allProducts = await products
      .aggregate([
        {
          $unionWith: {
            coll: "productsone",
          },
        },
      ])
      .toArray();

    app.post("/products", async (req, res) => {
      try {
        const data = await allProducts.find().toArray();
        res.status(200).send(data);
      } catch (err) {
        res.status(404).send(err.message);
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(PORT, () => console.log("server listening on port", PORT));
