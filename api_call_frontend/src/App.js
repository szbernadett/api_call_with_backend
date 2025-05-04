import React, { useState, useEffect } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useNavigate
} from "react-router-dom";
import { apiCall } from "./utils/fetchData";
import { createCities } from "./utils/cityFactory";
import {
  getAttractionSearchInfo,
  getCitySearchInfo,
  getCurrentTempSearchInfo,
  getForecastSearchInfo,
} from "./utils/searchInfoFactory";
import AppLayout from "./components/AppLayout";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import { checkAuthStatus, logout } from "./services/authService";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar, 
  CircularProgress,
  Paper,
  Tabs,
  Tab
} from "@mui/material";
import Header from "./components/Header";

// Admin route protection component
const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userData = await checkAuthStatus();
        setIsAdmin(userData.user.isAdmin);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return isAdmin ? children : <Navigate to="/" />;
};

// We need to create wrapper components for LoginForm and SignupForm
// since useNavigate must be used inside a Router context
const LoginPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  return (
    <LoginForm onSuccess={(userData) => {
      setIsAuthenticated(true);
      setUser(userData);
      navigate('/');
    }} />
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  return (
    <SignupForm onSuccess={(userData) => {
      setIsAuthenticated(true);
      setUser(userData);
      navigate('/');
    }} />
  );
};

export default function App() {
  // Add authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authTab, setAuthTab] = useState(0); // 0 for login, 1 for signup
  const [cities, setCities] = useState(null);
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { callApi } = apiCall();
  
  // Check if user is already logged in
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await checkAuthStatus();
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    verifyAuth();
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUser(null);
    setCities(null);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setAuthTab(newValue);
  };
  
  /**************************************************************************** */
  /*                          SEARCH HANDLER FUNCTION                           */
  /**************************************************************************** */

  async function handleSearch(city, selectedCategories) {
    // Only allow search if authenticated
    if (!isAuthenticated) {
      setError("Please log in to use the search feature");
      return;
    }
    
    setError(null);
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
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Header 
              handleSearch={handleSearch} 
              isAuthenticated={isAuthenticated} 
              user={user} 
              onLogout={handleLogout}
            />
            <AppLayout {...props} />
          </>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

