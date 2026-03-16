import { Router } from "express";
import { celebrate } from "celebrate";
import { getNoteById, getAllNotes, createNote, deleteNote, updateNote } from "../controllers/notesController.js";
import { createNoteSchema, getAllNotesSchema, noteIdSchema, updateNoteSchema } from "../validations/notesValidation.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use("/notes", authenticate);

// Маршрут отримання всіх нотаток
router.get("/notes", celebrate(getAllNotesSchema), getAllNotes);

// Динамічний маршрут для отримання нотатки за ID
router.get("/notes/:noteId", celebrate(noteIdSchema), getNoteById);

// Маршрут створення нової нотатки
router.post("/notes", celebrate(createNoteSchema), createNote);

// Маршрут видалення нотатки
router.delete("/notes/:noteId", celebrate(noteIdSchema), deleteNote);

// Маршрут оновлення нотатки
router.patch("/notes/:noteId", celebrate(updateNoteSchema), updateNote);




export default router;
