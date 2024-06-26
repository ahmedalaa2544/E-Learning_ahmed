import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

export const createVideoSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    // title: joi.string(),
    // describtion: joi.string().allow(""),
  })
  .unknown(true);

export const createArticleSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    title: joi.string(),
    quillContent: joi.string().allow(""),
  })
  .unknown(true);
export const createQuizSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    title: joi.string(),
  })
  .unknown(true);
export const editCurriculumSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    curriculumId: joi.string().custom(isValidObjectId).required(),
    startPosition: joi.string().required(),
    endPosition: joi.string().required(),
  })
  .unknown(true);

export const editVideoSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    curriculumId: joi.string().custom(isValidObjectId).required(),
    title: joi.string(),
    descriPtion: joi.string().allow(""),
  })
  .unknown(true);

export const editArticleSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    curriculumId: joi.string().custom(isValidObjectId).required(),
    title: joi.string(),
    quillContent: joi.string().allow(""),
  })
  .unknown(true);
export const basicSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    curriculumId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const videoProgressSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    curriculumId: joi.string().custom(isValidObjectId).required(),
    lastWatchedSecond: joi.number().required(),
  })
  .required();
export const curriculumCompletedSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    curriculumId: joi.string().custom(isValidObjectId).required(),
    completed: joi.boolean().required(),
  })
  .required();

export const getVideoSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    videoId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const getArticleSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    articleId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
export const getCurriculumSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
    curriculumId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
export const getCurriculumsSchema = joi
  .object({
    courseId: joi.string().custom(isValidObjectId).required(),
    chapterId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
