"use server";

import Question from "@/database/question.model";
import { ViewQuestionParams } from "../types/sharedtypes";
import Interaction from "@/database/interaction.model";
import { withDatabase } from "./with-database";

const viewQuestion = withDatabase(
  "viewQuestion",
  async (params: ViewQuestionParams) => {
    const { questionId, userId } = params;

    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

    if (userId) {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId,
      });

      if (existingInteraction) return console.log("User has already viewed");

      await Interaction.create({
        user: userId,
        action: "view",
        question: questionId,
      });
    }
  },
);

export { viewQuestion };
