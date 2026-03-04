import { Joi, Segments } from "celebrate";
import { TAGS } from "../constants/tags";
import { isValidObjectId } from "mongoose";



const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.mssage('Invalid id format') : value;
};


export const getAllNotesSchema = {
  [Segments.PARAMS]: Joi.Object({
    page: Joi.integer().min(1).default(1).required(),
    perPage: Joi.integer().min(5).max(20).default(10).required(),
    tag: Joi.string().valid(TAGS),
    search: Joi.string().allow(""),
  })
};


export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  })
};


export const createNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow(""),
    tag: Joi.string().valid(TAGS),
  })
};

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1),
    content: Joi.string().allow(""),
    tag: Joi.string().valid(TAGS),
  }).min(1),
};
