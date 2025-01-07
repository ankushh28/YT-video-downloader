# YT-video-downloader

import crypto from "crypto";
import { Category } from "../models/Category";
import { Attribute } from "../models/Attribute";

// Normalize string for SKU format
const normalizeString = (str: string): string => {
  return str.toUpperCase().replace(/\s+/g, "-");
};

// Optimized SKU generation
export const generateSKU = async (
  title: string,
  categoryId: string,
  attributes: { attributeId: string; optionId: string }[]
): Promise<string> => {
  try {
    // Fetch category and attribute data in a single batch query
    const [category, attributesData] = await Promise.all([
      Category.findById(categoryId).lean().select("name"),
      Attribute.find({
        _id: { $in: attributes.map((attr) => attr.attributeId) },
      })
        .lean()
        .select("name options"),
    ]);

    if (!category) {
      throw new Error("Invalid category ID");
    }

    const categoryName = normalizeString(category.name);

    // Map attributes to their option values
    const attributeStrings: string[] = attributes.map((attr) => {
      const attribute = attributesData.find(
        (a) => a._id.toString() === attr.attributeId
      );

      if (!attribute) {
        throw new Error(`Attribute not found: ${attr.attributeId}`);
      }

      const option = attribute.options.find(
        (opt) => opt._id.toString() === attr.optionId
      );

      if (!option) {
        throw new Error(
          `Option not found for attribute: ${attr.attributeId}, option: ${attr.optionId}`
        );
      }

      return normalizeString(option.value);
    });

    // Combine product title, category, and attributes into a single string
    const dataString = [
      normalizeString(title), // Product Title
      categoryName,          // Category Name
      ...attributeStrings,   // Attribute Values
    ].join("-");

    // Generate a compact SKU using SHA-1 (faster than SHA-256)
    const skuHash = crypto.createHash("sha1").update(dataString).digest("hex");

    // Return a compact SKU (e.g., 12 characters max)
    return skuHash.substring(0, 12).toUpperCase();
  } catch (error) {
    console.error("Error generating SKU:", error.message);
    throw new Error("Failed to generate SKU");
  }
};
