"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { QueryFilter } from "mongoose";

import Tag, { ITag } from "@/database/tag.model";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "../types/sharedtypes";
import Question from "@/database/question.model";

export type TagListItem = {
  _id: string;
  name: string;
  questions: string[];
};

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    // Find interactions for the user and group by tags...
    // Interaction...

    return [
      { _id: "1", name: "tag" },
      { _id: "2", name: "tag2" },
    ];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllTags(
  params: GetAllTagsParams,
): Promise<{ tags: TagListItem[] }> {
  try {
    connectToDatabase();

    const { searchQuery } = params;

    const query: QueryFilter<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    const tags = await Tag.find(query)
      .select("_id name questions")
      .lean<TagListItem[]>();

    return {
      tags: tags.map((tag) => ({
        _id: String(tag._id),
        name: tag.name,
        questions: Array.isArray(tag.questions)
          ? tag.questions.map(String)
          : [],
      })),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();

    const { tagId, searchQuery } = params;

    const tagFilter: QueryFilter<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    // Convert Mongoose documents (with ObjectId) to plain JSON objects
    // so the frontend receives string IDs and populated subdocuments.
    const questions = tag.questions;

    return { tagTitle: tag.name, questions };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getTopPopularTags() {
  try {
    connectToDatabase();

    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
