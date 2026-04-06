const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const client = new MongoClient("mongodb://localhost:27017");

let db;

client.connect().then(() => {
  db = client.db("studentDB");
  console.log("MongoDB Connected");
});

// Add Student
app.post("/add", async (req, res) => {
  await db.collection("students").insertOne(req.body);
  res.send("Student Added");
});

// Get All Students
app.get("/students", async (req, res) => {
  const data = await db.collection("students").find().toArray();
  res.json(data);
});

// Search by Skill
app.get("/search/:skill", async (req, res) => {
  const data = await db.collection("students")
    .find({ skills: req.params.skill })
    .toArray();
  res.json(data);
});

app.listen(3000, () => console.log("Server running on 3000"));