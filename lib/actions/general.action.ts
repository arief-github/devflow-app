"use server";

import { Model, Document } from "mongoose";
import Question from "@/database/question.model";
import User from "@/database/user.model";
import Answer from "@/database/answer.model";
import Tag from "@/database/tag.model";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "../types/sharedtypes";

// ─── Types ───────────────────────────────────────────────────────────────────

const SearchableTypes = ["question", "answer", "user", "tag"] as const;
type SearchableType = (typeof SearchableTypes)[number];

interface SearchDocument {
  _id?: unknown;
  clerkId?: unknown;
  question?: unknown;
  [key: string]: unknown;
}

interface SearchResult {
  title: string;
  type: SearchableType;
  id: string;
}

interface ModelRegistry {
  model: Model<Document>;
  searchField: string;
  type: SearchableType;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const modelsAndTypes: ModelRegistry[] = [
  { model: Question, searchField: "title", type: "question" },
  { model: User, searchField: "name", type: "user" },
  { model: Answer, searchField: "content", type: "answer" },
  { model: Tag, searchField: "name", type: "tag" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildResult(
  item: SearchDocument,
  type: SearchableType,
  searchField: string,
  query: string,
): SearchResult {
  return {
    title:
      type === "answer"
        ? `Answers containing ${query}`
        : String(item[searchField]),
    type,
    id:
      type === "user"
        ? String(item.clerkId ?? "")
        : type === "answer"
          ? String(item.question ?? "")
          : String(item._id ?? ""),
  };
}

// ─── Server Action ────────────────────────────────────────────────────────────

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();

    const { query, type } = params;
    const normalizedQuery = query?.trim() ?? "";
    const regexQuery = { $regex: normalizedQuery, $options: "i" };

    let results: SearchResult[] = [];

    const typeLower = type?.toLowerCase() as SearchableType | undefined;
    const isValidType = typeLower && SearchableTypes.includes(typeLower);

    if (!isValidType) {
      // Search across all models — limit 2 per model, max 8 total
      for (const { model, searchField, type: modelType } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);

        results.push(
          ...queryResults.map((item) =>
            buildResult(
              item as unknown as SearchDocument,
              modelType,
              searchField,
              normalizedQuery,
            ),
          ),
        );
      }
    } else {
      // Search within a specific model — limit 8
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);

      if (!modelInfo) throw new Error("Invalid search type");

      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      results = queryResults.map((item) =>
        buildResult(
          item as unknown as SearchDocument,
          typeLower,
          modelInfo.searchField,
          normalizedQuery,
        ),
      );
    }

    return JSON.stringify(results);
  } catch (error) {
    console.error("Error fetching global results:", error);
    throw error;
  }
}
