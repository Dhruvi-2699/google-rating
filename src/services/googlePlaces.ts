import axios from "axios";

// Replace this with your Google Places API key
const GOOGLE_API_KEY = "AIzaSyDHxXQvw8JFLiHJmTX_FYYFz0yMHjyJuOA";

export const findPlaceByCoordinates = async (lat: string, lon: string) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${lat},${lon}`,
          radius: "100",
          type: "restaurant",
          key: GOOGLE_API_KEY,
        },
      }
    );

    // Get the first (closest) result
    const place = response.data.results[0];
    if (place) {
      return {
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        place_id: place.place_id,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
};
