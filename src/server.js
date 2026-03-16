import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errors } from "celebrate";
import "dotenv/config";

import { connectMongoDB } from "./db/connectMongoDB.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { logger } from "./middleware/logger.js";
import notesRouter from "./routes/notesRoutes.js";
import authRouter from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(logger);
app.use(express.json({
  type: ['application/json', 'application/vnd.api+json'],
}));
app.use(cors());
app.use(cookieParser());

app.use(notesRouter);
app.use(authRouter);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
