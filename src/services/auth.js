import crypto from "crypto";
import { Session } from "../models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/time.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

export async function createSession(userId) {
  const accessToken = crypto.randomBytes(32).toString("hex");
  const refreshToken = crypto.randomBytes(32).toString("hex");
  const now = Date.now();

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + ONE_DAY),
  });

  return session;
}

export function setSessionCookies(res, session) {
  res.cookie("accessToken", session.accessToken, {
    ...cookieOptions,
    maxAge: FIFTEEN_MINUTES,
  });
  res.cookie("refreshToken", session.refreshToken, {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });
  res.cookie("sessionId", session._id.toString(), {
    ...cookieOptions,
    maxAge: ONE_DAY,
  });
}
