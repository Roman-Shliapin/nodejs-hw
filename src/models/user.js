import mongoose from "mongoose";

const defaultAvatar =
  "https://ac.goit.global/fullstack/react/default-avatar.jpg";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    avatar: {
      type: String,
      required: false,
      default: defaultAvatar,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre("save", function (next) {
  if (this.username == null || this.username === "") {
    this.username = this.email;
  }
  next();
});

export const User = mongoose.model("User", userSchema);
