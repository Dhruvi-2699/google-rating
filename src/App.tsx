import { useEffect, useState } from "react";
import axios from "axios";
import type { Restaurant } from "./types";
import { RestaurantCard } from "./components/RestaurantCard";
import "./App.css";

function App() {
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [displayedRestaurants, setDisplayedRestaurants] = useState<
    Restaurant[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const itemsPerPage = 12;

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationLoading(false);
        setSortByDistance(true); // Auto-enable distance sorting when location is obtained
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: "restaurant in Vadodara",
              format: "json",
              addressdetails: 1,
              limit: 100, // Get maximum results
            },
            headers: {
              "User-Agent": "RestaurantFinderApp/1.0",
            },
          }
        );

        const restaurants = response.data;
        setAllRestaurants(restaurants);
        setFilteredRestaurants(restaurants);

        // Set initial page
        const startIndex = 0;
        const endIndex = Math.min(itemsPerPage, restaurants.length);
        setDisplayedRestaurants(restaurants.slice(startIndex, endIndex));
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

  // Search functionality with distance sorting
  useEffect(() => {
    let filtered: Restaurant[] = [];

    if (searchQuery.trim() === "") {
      filtered = allRestaurants;
    } else {
      filtered = allRestaurants.filter(
        (restaurant) =>
          restaurant.display_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          restaurant.address?.road
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          restaurant.address?.suburb
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          restaurant.address?.city
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Sort by distance if user location is available and sorting is enabled
    if (sortByDistance && userLocation) {
      filtered = filtered.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          parseFloat(a.lat),
          parseFloat(a.lon)
        );
        const distanceB = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          parseFloat(b.lat),
          parseFloat(b.lon)
        );
        return distanceA - distanceB;
      });
    }

    setFilteredRestaurants(filtered);
    setCurrentPage(1); // Reset to first page when searching or sorting
  }, [searchQuery, allRestaurants, sortByDistance, userLocation]);

  // Update displayed restaurants when page changes or filter changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(
      startIndex + itemsPerPage,
      filteredRestaurants.length
    );
    setDisplayedRestaurants(filteredRestaurants.slice(startIndex, endIndex));
  }, [currentPage, filteredRestaurants]);

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

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

          {/* Search Bar */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search restaurants by name or location..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Location Controls */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                locationLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : userLocation
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {locationLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Getting Location...
                </>
              ) : userLocation ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Location Enabled
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Get My Location
                </>
              )}
            </button>

            {userLocation && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sortByDistance}
                  onChange={(e) => setSortByDistance(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Sort by distance</span>
              </label>
            )}
          </div>

          {/* Location Error */}
          {locationError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{locationError}</p>
            </div>
          )}
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
          <>
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-800">
                  {filteredRestaurants.length > 0 ? (
                    <>
                      Found <strong>{filteredRestaurants.length}</strong>{" "}
                      restaurant{filteredRestaurants.length !== 1 ? "s" : ""}{" "}
                      matching "{searchQuery}"
                    </>
                  ) : (
                    <>
                      No restaurants found matching "
                      <strong>{searchQuery}</strong>". Try a different search
                      term.
                    </>
                  )}
                </p>
              </div>
            )}

            {displayedRestaurants.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedRestaurants.map((restaurant, index) => {
                    const distance = userLocation
                      ? calculateDistance(
                          userLocation.lat,
                          userLocation.lon,
                          parseFloat(restaurant.lat),
                          parseFloat(restaurant.lon)
                        )
                      : undefined;

                    return (
                      <RestaurantCard
                        key={`${currentPage}-${index}`}
                        restaurant={restaurant}
                        index={(currentPage - 1) * itemsPerPage + index}
                        distance={distance}
                      />
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-2">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else {
                            if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-2 rounded ${
                                currentPage === pageNum
                                  ? "bg-orange-500 text-white"
                                  : "bg-white text-gray-700 hover:bg-orange-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center text-gray-600">
                  {filteredRestaurants.length > 0 && (
                    <>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredRestaurants.length
                      )}{" "}
                      of {filteredRestaurants.length} restaurants
                      {searchQuery &&
                        ` (filtered from ${allRestaurants.length} total)`}
                    </>
                  )}
                </div>
              </>
            ) : (
              !searchQuery && (
                <div className="text-center text-gray-500 mt-8">
                  No restaurants found. Please try again later.
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
