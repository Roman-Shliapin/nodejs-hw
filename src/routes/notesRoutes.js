import { Router } from "express";
import { getNoteById, getAllNotes, createNote, deleteNote, updateNote } from "../controllers/notesController.js";
import { celebrate } from "celebrate";
import { createNoteSchema, getAllNotesSchema, noteIdSchema, updateNoteSchema } from "../validations/notesValidation.js";

const router = Router();

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
