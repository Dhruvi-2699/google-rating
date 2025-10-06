import type { Restaurant } from "../types";
import { getRestaurantImage, getCuisineType } from "../utils";

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
  distance?: number;
}

export const RestaurantCard = ({
  restaurant,
  index,
  distance,
}: RestaurantCardProps) => {
  const name = restaurant.display_name.split(",")[0];
  const cuisineType = getCuisineType(name);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        <img
          src={getRestaurantImage(index)}
          alt={`${name} - ${cuisineType}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            <p className="text-sm text-orange-600 mt-1">{cuisineType}</p>
          </div>
          <div className="flex items-center bg-green-100 px-2 py-1 rounded">
            <span className="text-sm font-medium text-green-700">4.2 ★</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 text-left">
          {restaurant.display_name}
        </p>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-500">₹200 for two</div>
          <div className="flex items-center gap-2">
            {distance !== undefined && (
              <div className="text-sm text-blue-600 font-medium">
                {distance} km
              </div>
            )}
            <div className="text-sm text-orange-600">30-40 mins</div>
          </div>
        </div>
      </div>
    </div>
  );
};
