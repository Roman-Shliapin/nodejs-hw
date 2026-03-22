import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Handlebars from "handlebars";
import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { createSession, setSessionCookies } from "../services/auth.js";
import { sendEmail } from "../utils/sendMail.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resetPasswordTemplatePath = join(
  __dirname,
  "../templates/reset-password-email.html"
);

let compiledResetPasswordTemplate;

async function renderResetPasswordEmail(name, resetLink) {
  if (!compiledResetPasswordTemplate) {
    const source = await readFile(resetPasswordTemplatePath, "utf-8");
    compiledResetPasswordTemplate = Handlebars.compile(source);
  }
  return compiledResetPasswordTemplate({ name, resetLink });
}

export async function registerUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(400, "Email in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid credentials");
    }

    await Session.deleteMany({ userId: user._id });
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function refreshUserSession(req, res, next) {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      throw createHttpError(401, "Session not found");
    }

    const session = await Session.findOne({ _id: sessionId, refreshToken });

    if (!session) {
      throw createHttpError(401, "Session not found");
    }

    if (session.refreshTokenValidUntil < new Date()) {
      throw createHttpError(401, "Session token expired");
    }

    const userId = session.userId;
    await Session.findByIdAndDelete(session._id);

    const newSession = await createSession(userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: "Session refreshed" });
  } catch (err) {
    next(err);
  }
}

const clearCookieOptions = { httpOnly: true, secure: true, sameSite: "none" };

export async function logoutUser(req, res, next) {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.findByIdAndDelete(sessionId);
    }

    res.clearCookie("sessionId", clearCookieOptions);
    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", clearCookieOptions);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

const resetSuccessMessage = { message: "Password reset email sent successfully" };

export async function requestResetEmail(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json(resetSuccessMessage);
    }

    if (!process.env.JWT_SECRET) {
      throw createHttpError(500, "Server configuration error");
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const base = (process.env.FRONTEND_DOMAIN ?? "").replace(/\/$/, "");
    const resetLink = `${base}/reset-password?token=${encodeURIComponent(token)}`;

    const name = user.username || user.email;
    const html = await renderResetPasswordEmail(name, resetLink);

    try {
      await sendEmail({
        to: user.email,
        from: process.env.SMTP_FROM,
        subject: "Скидання паролю",
        html,
      });
    } catch {
      throw createHttpError(
        500,
        "Failed to send the email, please try again later."
      );
    }

    return res.status(200).json(resetSuccessMessage);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createHttpError(500, "Server configuration error");
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw createHttpError(401, "Invalid or expired token");
    }

    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
}
