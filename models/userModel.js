import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minLength: [6, "Length should be minimum 6"],
  },
  email: {
    type: String,
    required: [true, "Email already exist"],
    unique: true,
    validate: {
      validator: function (v) {
        // Regular expression for email validation
        return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  about: String,
  avatar: {
    public_id: String,
    url: String,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    select: false,
    minLength: [8, "password should be of 8 characters"],
    validate: {
      validator: function (pass) {
        // Regular expression for password validation
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          pass
        );
      },
      message: (props) =>
        `${props.value} is not a valid password! Password must contain at least one letter, one digit, one special character, and be at least 8 characters long.`,
    },
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (enteredpassword) {
  return await bcrypt.compare(enteredpassword, this.password);
};

userSchema.methods.generateJwtToken = async function () {
  try {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
  }
};

export default mongoose.model("User", userSchema);
