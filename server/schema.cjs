const { Schema, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const usersSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  testType: {
    type: String,
    enum: ["eng", "nbs"],
  },
  expired: Boolean,
  result: [{ subject: String, score: Number, total: Number }],
});

usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

const questionsSchema = new Schema({
  testType: {
    type: String,
    enum: ["eng", "nbs"],
  },
  questions: [
    {
      subject: String,
      questions: [
        {
          question: String,
          options: [String],
          answer: String,
          category: {
            type: String,
            default: "unattempted",
          },
          selectedOption: String,
        },
      ],
    },
  ],
});

const User = mongoose.model("users", usersSchema);
const Question = mongoose.model("questions", questionsSchema);

module.exports = { User, Question };
