import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: [6, "Length should be minimum 6"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        // Regular expression for email validation
        return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  about: {
    type: String,
    default: "Hey there! I am using chat app.",
  },
  avatar: {
    public_id: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
    minLength: 8,
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
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  } catch (error) {
    console.log(error);
  }
};

export const User = mongoose.model("User", userSchema);
