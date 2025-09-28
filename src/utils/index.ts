import { RESTAURANT_IMAGES, CUISINE_TYPES } from "../constants";

export const getRestaurantImage = (index: number): string => {
  return RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length];
};

export const getCuisineType = (name: string): string => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("pizza") || lowerName.includes("italian"))
    return CUISINE_TYPES.ITALIAN;
  if (lowerName.includes("coffee") || lowerName.includes("cafe"))
    return CUISINE_TYPES.CAFE;
  if (lowerName.includes("farsan")) return CUISINE_TYPES.FARSAN;
  if (lowerName.includes("gujarati")) return CUISINE_TYPES.GUJARATI;
  if (lowerName.includes("south") || lowerName.includes("dosa"))
    return CUISINE_TYPES.SOUTH_INDIAN;
  if (lowerName.includes("punjabi")) return CUISINE_TYPES.PUNJABI;
  if (lowerName.includes("chinese")) return CUISINE_TYPES.CHINESE;

  return CUISINE_TYPES.DEFAULT;
};
