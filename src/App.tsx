import { useEffect, useState } from "react";
import axios from "axios";
import type { Restaurant } from "./types";
import { RestaurantCard } from "./components/RestaurantCard";
import "./App.css";

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: "restaurant in Vadodara",
              format: "json",
              addressdetails: 1,
              limit: 50,
            },
            headers: {
              "User-Agent": "RestaurantFinderApp/1.0",
            },
          }
        );
        setRestaurants(response.data);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error details:", error.message);
        }
        console.error("Failed to fetch restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Discover Vadodara's Best Restaurants
          </h1>
          <p className="mt-2 text-gray-600">
            Find your next favorite dining spot
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-gray-600">
              Loading amazing restaurants...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={index}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
