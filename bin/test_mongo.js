require("dotenv").config();
const assert = require("assert");
const MongoClient = require("mongodb").MongoClient;

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri);
client.connect(async function (err) {
  assert.strictEqual(null, err);
  console.log("Connected successfully");
  const db = client.db(process.env.MONGO_DB);
  console.log("got db");
  const coll = db.collection("users");
  const query = { username: "ovenrake" };
  const user = await coll.findOne(query);
  console.log(user);
  client.close();
});
