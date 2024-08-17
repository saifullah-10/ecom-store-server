const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const PORT = process.env.PORT || 5000;

require("dotenv").config();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
const database = client.db("scic-product");
const products = database.collection("products");
// const productsOne = database.collection("productsone");

// Merge collections

async function run() {
  try {
    app.get("/allProducts", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const price = req.query.price;
      const brand = req.query.brand;
      const category = req.query.category;
      const search = req.query.search;
      const brandArr = brand ? brand.split(",") : [];
      const categoryArr = category ? category.split(",") : [];
      const priceRange = parseInt(req.query.range) || null;

      let query = {};

      if (brand.length > 0) {
        query.brandName = { $in: brandArr };
      }
      if (categoryArr.length > 0) {
        query.category = { $in: categoryArr };
      }

      if (priceRange !== null) {
        query.price = { $gte: priceRange - 49, $lte: priceRange };
      }
      console.log(search);

      if (search) {
        query.productName = { $regex: search, $options: "i" };
      }
      // sort by price
      let sortOption = {};
      if (price === "Low_To_High") {
        sortOption.price = 1;
      } else if (price === "High_To_Low") {
        sortOption.price = -1;
      }

      const limit = 9;
      const skip = (page - 1) * limit;

      try {
        const count = await products.find(query).sort(sortOption).toArray();

        const allProducts = await products
          .find(query)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .toArray();
        res.status(200).json({ allProducts, totalCount: count.length });
      } catch (err) {
        return res.status(500).send({ message: "Failed to fetch data" });
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
