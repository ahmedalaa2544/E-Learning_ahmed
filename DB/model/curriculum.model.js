import { Schema, model, Types } from "mongoose";

const curriculumSchema = new Schema(
  {
    course: {
      type: Types.ObjectId,
      ref: "Course",
      reuired: true,
    },
    chapter: {
      type: Types.ObjectId,
      ref: "Chapter",
      reuired: true,
    },
    type: {
      type: String,
      enum: ["video", "article", "quiz"],
      required: true,
      set: (value) => (value === "" ? null : value),
    },
    order: {
      type: Number,
      required: true,
    },
    video: {
      type: Types.ObjectId,
      ref: "Video",
      required: function () {
        return this.type === "video";
      },
      set: (value) => (value === "" ? null : value),
    },
    article: {
      type: Types.ObjectId,
      ref: "Article",
      required: function () {
        return this.type === "article";
      },
      set: (value) => (value === "" ? null : value),
    },
    quiz: {
      type: Types.ObjectId,
      ref: "Quiz",
      required: function () {
        return this.type === "quiz";
      },
      set: (value) => (value === "" ? null : value),
    },
    title: {
      type: String,
      required: true,
    },
    resources: [
      {
        title: {
          type: String,
          max: 60,
        },
        blobName: {
          type: String,
        },
        type: {
          type: String,
        },
        size: {
          type: Number,
        },
      },
    ],
  },

  { timestamps: true }
);

const curriculumModel = model("Curriculum", curriculumSchema);
export default curriculumModel;
