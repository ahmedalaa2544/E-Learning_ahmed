import { Router } from "express";
import isAuthenticated from "../../middleware/authntication.middleware.js";
import { validation } from "../../middleware/validation.js";
import { customValidation, fileUpload } from "../../utils/multer.js";
import chapterRouter from "../chapter/chapter.router.js";
import isAuthorized from "./course.authorization.js";
import * as courseController from "./course.controller.js";
import * as validators from "./course.validation.js";
const router = Router();
/**
 * Router for managing chapters within a specific course.
 * Mounted at: /courses/:courseId/chapter
 */
router.use("/:courseId/chapter", chapterRouter);

router.get(
  "/search",
  (req, res, next) => {
    if (!req.headers.token) {
      courseController.search(req, res, next);
    } else {
      next();
    }
  },
  isAuthenticated,
  courseController.search
);

router.get("/all-courses", courseController.getAll);

/**
 * Create a new course.
 * Route: POST /courses
 * Middleware: isAuthenticated, validation, fileUpload
 */
router.post(
  "/",
  isAuthenticated,
  validation(validators.createCourseSchema),
  courseController.createCourse
);

/**
 * Edit details of a specific course.
 * Route: PATCH /courses/:courseId
 * Middleware: isAuthenticated, isAuthorized, validation, fileUpload
 */
router.patch(
  "/:courseId",
  isAuthenticated,
  isAuthorized(["Instructor"]),
  validation(validators.editCourseSchema),
  fileUpload(customValidation.image.concat(customValidation.video)).fields([
    { name: "coverImage", maxCount: 1 },
    { name: "promotionalVideo", maxCount: 1 },
  ]),
  courseController.editCourse
);

/**
 * Delete a specific course.
 * Route: DELETE /courses/:courseId
 * Middleware: isAuthenticated, isAuthorized, validation
 */
router.delete(
  "/:courseId",
  isAuthenticated,
  isAuthorized(["Instructor"]),
  validation(validators.deleteCourseSchema),
  courseController.deleteCourse
);

/**
 * Retrieve details of a specific course.
 * Route: GET /courses/:courseId
 * Middleware: validation
 */
router.get(
  "/:courseId",
  (req, res, next) => {
    if (!req.headers.token) {
      courseController.getCourse(req, res, next);
    } else {
      next();
    }
  },
  isAuthenticated,
  validation(validators.getCourseSchema),
  courseController.getCourse
);
// retrieves course content only
router.get(
  "/:courseId/content",
  validation(validators.getCourseSchema),
  courseController.getCourseContent
);
// retrieves course content for enrolled student

router.get(
  "/:courseId/contentForStudent",
  validation(validators.getCourseSchema),
  courseController.getCourseContentForSudent
);
/**
 * Route: GET /courses
 * Description: Retrieve a list of courses created by the authenticated user.
 * Middleware: isAuthenticated
 *
 * This route supports an optional query parameter 'view', where:
 * - If 'view' is set to 'all', it triggers the 'getCourses' method to fetch all courses without check is authenticated.
 * - If 'view' is not provided or set to any other value, the route proceeds to the next middleware and check if is authenticated.
 */
router.get(
  "/",
  (req, res, next) => {
    if (req.query.view === "all" || req.query.view === undefined) {
      courseController.getCourses(req, res, next);
    } else {
      next();
    }
  },
  isAuthenticated,
  courseController.getCourses
);

/**
 * Route to retrieve courses associated with a specific category.
 */
router.get(
  "/category/:categoryId/subCategory/",
  validation(validators.getCoursesWithCategSchema),
  courseController.getCoursesWithCategAndSubCateg
);

/**
 * Route to retrieve courses associated with a specific category and subCategory.
 */
router.get(
  "/category/:categoryId/subCategory/:subCategoryId",
  validation(validators.getCoursesWithCategAndSubCategSchema),
  courseController.getCoursesWithCategAndSubCateg
);
/**
 * Route for posting a rating for a specific course.
 */
router.post(
  "/:courseId/rating",
  isAuthenticated,
  validation(validators.createRatingSchema),
  courseController.postRating
);

/**
 * Route for posting a comment for a specific course.
 */
router.post(
  "/:courseId/comment",
  isAuthenticated,
  validation(validators.createcommentSchema),
  courseController.postComment
);

/**
 * PATCH route to submit a course for publishing.
 * */

router.patch(
  "/:courseId/submit",
  isAuthenticated,
  isAuthorized(["Instructor"]),
  validation(validators.deleteCourseSchema),
  courseController.submitCourse
);

router.get("/show-course/:courseId", courseController.showCourse);

router.get("/:type/:curriculumId", courseController.showCurriculum);

export default router;
