import React, { useState } from "react";
import { apiCall } from "./utils/fetchData";
import { createCities } from "./utils/cityFactory";
import {
  getAttractionSearchInfo,
  getCitySearchInfo,
  getCurrentTempSearchInfo,
  getForecastSearchInfo,
} from "./utils/searchInfoFactory";
import AppLayout from "./components/AppLayout";

export default function App() {
  const [cities, setCities] = useState(null);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { callApi } = apiCall();

  /**************************************************************************** */
  /*                          SEARCH HANDLER FUNCTION                           */
  /**************************************************************************** */

  async function handleSearch(city, selectedCategories) {
    setError(null);
    setApiError(null);
    setLoading(true);
    const normalisedCity = city.toLowerCase();
    const cachedResult = getCachedData(normalisedCity, selectedCategories);

    if (!normalisedCity) {
      alert("Please enter a city name");
      return;
    }

    const encodedCityName = encodeURIComponent(normalisedCity);
    const encodedCategories = encodeURIComponent(JSON.stringify(selectedCategories));

    try {
      const response = await fetch(`https://api-call-with-backend.onrender.com/cities/search?cityName=${encodedCityName}&categories=${encodedCategories}`);
      const result = await response.json();

      if (!response.ok) {
        setError(response.error);
        setLoading(false);
        return;
      }

      setCities(result["cities"]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  //   if (cachedResult.length > 0) {
  //     console.log(`Using cached data for "${city}"`);
  //     setCities(cachedResult);
  //     setLoading(false);
  //     return;
  //   }

  //   if (!city) {
  //     alert("Please enter a city name to search");
  //   }

  //   try {
  //     // Fetch city data
  //     const { data: cityData, error: cityError } = await callApi(
  //       getCitySearchInfo(city)
  //     );

  //     if (cityError) {
  //       setError(cityError);
  //       setApiError(cityError);
  //       setLoading(false);
  //       return;
  //     }

  //     // Create unique cities
  //     const initialCities = createCities(cityData.data);
  //     const uniqueCities = getUniqueCities(initialCities);

  //     // Fetch temperatures, attractions, and forecasts
  //     const citiesWithTemp = await fetchCitiesWithTemperature(uniqueCities);
  //     const citiesWithAttractions = await fetchCitiesWithAttractions(
  //       citiesWithTemp,
  //       selectedCategories
  //     );
  //     const citiesWithForecast = await fetchCitiesWithForecast(
  //       citiesWithAttractions
  //     );

  //     // Cache results if no API error occurred
  //     if (!apiError) {
  //       const existingData =
  //         JSON.parse(localStorage.getItem(normalisedCity)) || {};
  //       existingData[selectedCategories.sort().toString()] = citiesWithForecast;
  //       localStorage.setItem(normalisedCity, JSON.stringify(existingData));
  //     }
  //     setCities(citiesWithForecast);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
 //  }
  /**************************************************************************** */
  /*                       HELPER AND UTILITY FUNCTIONS                         */
  /**************************************************************************** */

  function getCachedData(normalisedCity, selectedCategories) {
    let results = [];
    const catsToKey = selectedCategories.sort().toString();
    const storedData = localStorage.getItem(normalisedCity);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const storedKeys = Object.keys(parsedData);
      if (storedKeys.includes(catsToKey)) {
        results = parsedData[catsToKey];
      }
    }
    return results;
  }

  // Removes duplicate cities by ID
  function getUniqueCities(cities) {
    return Array.from(new Map(cities.map((city) => [city.id, city])).values());
  }

  // Fetch temperatures for cities
  const fetchCitiesWithTemperature = async (cities) => {
    return Promise.all(
      cities.map(async (city) => {
        const { data: temperatureData, error: temperatureError } =
          await callApi(
            getCurrentTempSearchInfo(city.latitude, city.longitude)
          );

        if (temperatureError) {
          console.warn(
            "Error fetching temperature data:",
            temperatureError.message
          );
          setApiError(temperatureError);
          city.currentTemp = "No data available";
        } else {
          city.currentTemp =
            temperatureData?.current?.temp_c || "No data available";
        }

        return city;
      })
    );
  };

  //  Fetch attractions for cities
  const fetchCitiesWithAttractions = async (cities, selectedCategories) => {
    return Promise.all(
      cities.map(async (city) => {
        const { data: attractionsData, error: attractionsError } =
          await callApi(
            getAttractionSearchInfo(
              city.latitude,
              city.longitude,
              selectedCategories
            )
          );

        if (attractionsError) {
          console.warn(
            "Error fetching attractions data:",
            attractionsError.message
          );
          setApiError(attractionsError);
        } else {
          city.populateAttractions(attractionsData, selectedCategories);
        }

        return city;
      })
    );
  };

  // Fetch forecasts for cities
  const fetchCitiesWithForecast = async (cities) => {
    return Promise.all(
      cities.map(async (city) => {
        const { data: forecastData, error: forecastError } = await callApi(
          getForecastSearchInfo(city.latitude, city.longitude)
        );

        if (forecastError) {
          console.warn("Error fetching forecast data:", forecastError.message);
          setApiError(forecastError);
        } else {
          city.extractForecastData(forecastData);
        }

        return city;
      })
    );
  };

  /**************************************************************************** */
  /*                             RETURNED COMPONENTS                            */
  /**************************************************************************** */
  const props = { handleSearch, cities, error, loading };
  return <AppLayout {...props} />;
}

