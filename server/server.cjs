const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const fs = require("fs");
const { User } = require("./schema.cjs");
require("dotenv").config();

const JWT_SECRET = "waya-kana-jani";
const randomWords = [{ name: "Muhammad Amjad", email: "" }];

console.log(
  JSON.parse(fs.readFileSync("./users.json", "utf-8")).map(
    ({ name, email, original }) => {
      
      return { name, email, original };
    }
  )
);

mongoose
  .connect(
    "mongodb+srv://muhammadaljoufi:1RGIYsbu41JuSg7O@ahmed.9suue9g.mongodb.net/app"
  )
  .then(() => console.log("connection to DB made!"))
  .catch(() => "error while connecting");

app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  console.log("post request made");
  const { email, password } = req.body;
  try {
    // const concernedUser = users.find((elm) => elm.email === email);
    const concernedUser = await User.findOne({ email });
    if (!concernedUser) throw new Error("Invalid Email or Password");

    //   throw new Error("Incorrect password");
    const dbPassword = concernedUser.password;
    const isCorrect = bcrypt.compareSync(password, dbPassword);

    if (!isCorrect) throw new Error("Incorrect Password");
    if (concernedUser.expired) throw new Error("ID Expired");

    const token = jwt.sign({ email, password }, JWT_SECRET, {
      expiresIn: "7h", //
    });
    // mongoose query returns mongoose documents, they are not plain JS objects, so convert them using toObject() if you want to use spread operator
    res.status(200).json({
      status: "success",
      data: {
        name: concernedUser.name,
        email: concernedUser.email,
        testType: concernedUser.testType,
        token,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "failure", message: err.message });
  }
});

app.get("/mcqs", authorizeToken, async (req, res) => {
  fs.readFile(
    __dirname + "/./mcqArray.json",
    { encoding: "utf-8" },
    (err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          status: "failure",
          message: "Error occured while reading data",
        });
      }
      res.status(200).json({
        status: "success",
        data: JSON.parse(data),
      });
    }
  );
});

app.post("/submitResult", async (req, res) => {
  const { subjectScores, email } = req.body;
  try {
    await User.findOneAndUpdate(
      { email },
      { expired: true, result: subjectScores }
      // { result: subjectScores }
    );
    res.status(200).json({
      status: "success",
      message:
        "Test submitted successfully! You'll be informed via email duely",
    });
  } catch (err) {
    res.status(200).json({
      status: "failure",
      message: err.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Listening to port 3000!");
});

function authorizeToken(req, res, next) {
  const requestToken = req.headers.authorization;
  if (!requestToken)
    return res.status(403).json({
      status: "failure",
      message: "You don't have access to chat",
    });
  try {
    jwt.verify(requestToken, JWT_SECRET);
    next();
  } catch (error) {
    // console.log(error);
    res.status(403).json({ status: "failure", message: "Invalid token" });
  }
}
