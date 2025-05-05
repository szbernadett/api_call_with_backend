import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { apiCall } from "./utils/fetchData";
import { createCities } from "./utils/cityFactory";
import {
  getAttractionSearchInfo,
  getCitySearchInfo,
  getCurrentTempSearchInfo,
  getForecastSearchInfo,
} from "./utils/searchInfoFactory";
import AppLayout from "./components/AppLayout";
import AuthContainer from "./components/AuthContainer";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [cities, setCities] = useState(null);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { callApi } = apiCall();

  // Function to check if user is admin
  const isAdmin = (user) => {
    return user && user.username && user.username.toLowerCase() === "admin";
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("https://api-call-with-backend.onrender.com/auth/status", {
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("https://api-call-with-backend.onrender.com/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/admin" 
          element={
            isAdmin(user) ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            !user ? (
              <AuthContainer onLogin={handleLogin} />
            ) : (
              <AppLayout 
                handleSearch={handleSearch} 
                cities={cities} 
                error={error} 
                loading={loading} 
                user={user} 
                onLogin={handleLogin}
                onLogout={handleLogout} 
              />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

