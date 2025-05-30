import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
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

// Use a CORS proxy for development
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-call-with-backend.onrender.com'
  : 'https://cors-anywhere.herokuapp.com/https://api-call-with-backend.onrender.com';

export default function App() {
  const [cities, setCities] = useState(null);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const { callApi } = apiCall();

  // Function to handle closing the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  // Function to check if user is admin
  const isAdmin = (user) => {
    return user && user.username && user.username.toLowerCase() === "admin";
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
          credentials: 'include'
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
      await fetch(`${API_BASE_URL}/auth/logout`, {
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

    if (!normalisedCity) {
      alert("Please enter a city name");
      setLoading(false);
      return;
    }

    const encodedCityName = encodeURIComponent(normalisedCity);
    const encodedCategories = encodeURIComponent(JSON.stringify(selectedCategories));

    try {
      const response = await fetch(`${API_BASE_URL}/cities/search?cityName=${encodedCityName}&categories=${encodedCategories}`, {
        credentials: "include"
      });
      
      if (response.status === 401) {
        // If unauthorisssed, try to redirect to login
        setError("Please log in to search for cities");
        setUser(null); // Clear user state to show login form
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Search failed" }));
        setError(errorData.message || "Search failed");
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      setCities(result.cities || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Network error. Please try again later.");
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

  // Add this function to handle city deletion in UI
  const handleDeleteCity = (cityId) => {
    console.log(`Deleting city from state: ${cityId}`);
    setCities(prevCities => prevCities.filter(city => 
      city.id !== cityId && 
      city.name !== cityId && 
      !city.name.includes(cityId)
    ));
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
                setCities={setCities}
                error={error} 
                loading={loading} 
                user={user} 
                onLogin={handleLogin}
                onLogout={handleLogout}
                setSnackbar={setSnackbar}
              />
            )
          } 
        />
      </Routes>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity || "info"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BrowserRouter>
  );
}

