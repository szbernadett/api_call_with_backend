import React from "react";
import { Box, Grid2 } from "@mui/material";
import Footer from "./Footer";
import Header from "./Header";
import ErrorCard from "./ErrorCard";
import Loading from "./Loading";
import NoResultsCard from "./NoResultsCard";
import NoSearchCard from "./NoSearchCard";
import CardGrid from "./CardGrid";
import AuthContainer from "./AuthContainer";
import "../index.css";

export default function AppLayout({ handleSearch, cities, setCities, error, loading, user, onLogin, onLogout, setSnackbar }) {
  // Add a handler for city deletion
  const handleDeleteCity = (cityId) => {
    console.log(`Deleting city from state: ${cityId}`);
    setCities(prevCities => prevCities.filter(city => 
      city.id !== cityId && 
      city.name !== cityId && 
      !city.name.includes(cityId)
    ));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Header handleSearch={handleSearch} user={user} onLogout={onLogout} />
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          margin: "20px auto",
        }}
      >
        {!user ? (
          <AuthContainer onLogin={onLogin} />
        ) : (
          <>
            {cities?.length === 0 && <NoResultsCard />}
            {error && <ErrorCard />}
            {!loading && !cities && !error && <NoSearchCard />}
            {loading && <Loading />}
            {cities && !loading && (
              <Grid2 container spacing={2}>
                <CardGrid 
                  cities={cities} 
                  onDeleteCity={handleDeleteCity}
                  setCities={setCities}
                  setSnackbar={setSnackbar}
                />
              </Grid2>
            )}
          </>
        )}
      </Box>
      {/* Footer */}
      <Footer />
    </Box>
  );
}
