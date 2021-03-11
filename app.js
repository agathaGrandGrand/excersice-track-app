const express = require("express");
const app = express();
const mongoose = require("mongoose");
const shortid = require("shortid");
const bodyParser = require("body-parser");
const e = require("express");
const { ObjectId } = require("bson");
const urlEncoded = bodyParser.urlencoded({ extended: false });
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
//Connect to atlas mongodb
const URI =
  "mongodb+srv://mongo_1:mongo_1@cluster0.kfcyu.mongodb.net/exercise_app?retryWrites=true&w=majority";
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("Connection Status : " + mongoose.connection.readyState);
// *make Schema user

const exerciseSchema = new mongoose.Schema(
  {
    description: { type: String, default: "", required: true },
    duration: {
      type: Number,
      default: 0,
      required: true,
    },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);
// *make Schema exercise
const userSchema = new mongoose.Schema({
  _id: { type: String, default: shortid.generate() },
  username: { type: String, required: true },
  count: Number,
  log: [
    {
      type: exerciseSchema,
      default: {},
    },
  ],
});

//*make Model user
const users = mongoose.model("users", userSchema);
//*make model exercise
const exercises = mongoose.model("exercise", exerciseSchema);
//*add new document to collection
const createUser = async (username, _id) => {
  let new_user = new users({
    _id,
    username,
    count: 0,
    log: [],
  });

  new_user = await new_user.save();
  return { username, _id };
};

const addExercise = async (user, exercise) => {
  let new_exercise = new exercises(exercise);
  user.log.push(new_exercise);
  user.count += 1;
  user = await user.save();
  return exercise;
};
//CtCEA9SAi
//*post create user
app.use(urlEncoded);
app.post("/api/exercise/new-user", async (req, res) => {
  const username = req.body.username;
  const _id = shortid.generate();
  const findUser = await users.findOne({ username });
  if (findUser) {
    res.send("Username already taken");
  } else {
    createUser(username, _id).then(
      (value) => {
        res.json(value);
      },
      (error) => {
        res.send(error.errors["username"].properties.message);
      }
    );
  }
});
//*post exercise
app.post("/api/exercise/add", async (req, res) => {
  const _id = req.body.userId;
  const description = req.body.description;
  const duration = req.body.duration;
  let date = req.body.date !== "" ? new Date(req.body.date) : new Date();
  date = `${date.getUTCDate()}-${
    monthNames[date.getMonth()]
  }-${date.getFullYear()} `;
  const findUser = await users.findById(_id).catch((error) => {
    console.log(error);
  });

  if (!findUser) {
    res.send(`User "${_id}" not found`);
  } else {
    addExercise(findUser, { description, duration, date }).then(
      (value) => {
        res.json(value);
      },
      (error) => {
        keys = Object.keys(error.errors);
        console.log(error.errors[keys[0]].properties.message);
      }
    );
  }
});
//*export module
module.exports = app;
