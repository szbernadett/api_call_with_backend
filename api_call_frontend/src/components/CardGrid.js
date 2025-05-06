import React from "react";
import { Card, CardContent, Typography, Grid2, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ForecastChart from "./ForecastChart";

export default function CardGrid({ cities, onDeleteCity, setCities, setSnackbar }) {
  // Create a ref to store abort controllers
  const abortControllerRef = React.useRef({});
  
  // Clean up any pending requests when component unmounts
  React.useEffect(() => {
    return () => {
      // Abort any pending requests when component unmounts
      Object.values(abortControllerRef.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);
  
  const handleDelete = async (city) => {
    try {
      // Create an AbortController for this specific request
      const cityId = city.id || city.name;
      abortControllerRef.current[cityId] = new AbortController();
      const signal = abortControllerRef.current[cityId].signal;
      
      console.log(`Attempting to delete city: ${city.name} (ID: ${city.id})`);
      const deleteTarget = city.name;
      
      let response = await fetch(`https://api-call-with-backend.onrender.com/cities/${encodeURIComponent(deleteTarget)}`, {
        method: "DELETE",
        credentials: "include",
        signal // Pass the abort signal to the fetch request
      });
      
      // Clean up the controller after request completes
      delete abortControllerRef.current[cityId];
      
      if (response.ok) {
        console.log(`Successfully deleted city: ${city.name}`);
        
        // Update the UI to remove the deleted city
        if (typeof onDeleteCity === 'function') {
          // If parent component provided a handler, use it
          console.log("Using parent onDeleteCity function");
          onDeleteCity(city.id);
        } else if (typeof setCities === 'function') {
          // Otherwise update cities state directly
          console.log("Using setCities function");
          setCities(prevCities => {
            console.log("Filtering cities:", prevCities.length);
            return prevCities.filter(c => c.id !== city.id);
          });
        } else {
          console.warn("No method available to update city list after deletion");
          // As a last resort, reload the page to reflect the changes
          window.location.reload();
        }
        
        // Show success message if we have a snackbar function
        if (typeof setSnackbar === 'function') {
          setSnackbar({
            open: true,
            message: `City ${city.name} deleted successfully`,
            severity: "success"
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to delete city:", errorData.message || response.statusText);
        
        // Show error message if we have a snackbar function
        if (typeof setSnackbar === 'function') {
          setSnackbar({
            open: true,
            message: `Failed to delete city: ${errorData.message || response.statusText}`,
            severity: "error"
          });
        }
      }
    } catch (error) {
      // Don't show error for aborted requests
      if (error.name === 'AbortError') {
        console.log("Delete request was cancelled");
        return;
      }
      
      console.error("Error deleting city:", error);
      
      // Show error message if we have a snackbar function
      if (typeof setSnackbar === 'function') {
        setSnackbar({
          open: true,
          message: `Error deleting city: ${error.message}`,
          severity: "error"
        });
      }
    }
  };
  
  return (
    <Grid2
      container
      spacing={2}
      justifyContent="center"
      alignItems="flex-start"
    >
      {cities.map((city) => (
        <Grid2
          key={city.id || city.name}
          xs={12}
          sm={6}
          md={4}
          lg={3}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Card
            style={{
              minWidth: 320,
              maxWidth: 320,
              marginBottom: "10px",
              opacity: 0.97,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" component="div">
                  {city.name}
                </Typography>
                <IconButton 
                  onClick={() => handleDelete(city)}
                  size="small"
                  color="error"
                  aria-label="delete city"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Country:</strong> {city.countryName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Population:</strong> {city.population}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Latitude:</strong> {city.latitude}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Longitude:</strong> {city.longitude}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Current Temperature:</strong>{" "}
                {city.currentTemp === "No data available"
                  ? city.currentTemp
                  : `${city.currentTemp}°C`}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
              >
                <strong>Attractions:</strong>
                {city.displayAttractions &&
                Object.keys(city.displayAttractions).length > 0 ? (
                  Object.entries(city.displayAttractions).map(([category, values]) => (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      key={category}
                    >
                      <strong>{category}:</strong> {values.join(", ")}
                    </Typography>
                  ))
                ) : (
                  <em>None available</em>
                )}
              </Typography>
              {city.forecast?.length > 0 && (
                <ForecastChart forecast={city.forecast} />
              )}
            </CardContent>
          </Card>
        </Grid2>
      ))}
    </Grid2>
  );
}
