import createHttpError from "http-errors";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

export async function updateUserAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw createHttpError(400, "No file");
    }

    const result = await saveFileToCloudinary(req.file.buffer);
    const url = result.secure_url;

    req.user.avatar = url;
    await req.user.save();

    res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
}
