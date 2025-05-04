import React from "react";
import { Box, Grid } from "@mui/material";
import Footer from "./Footer";
import ErrorCard from "./ErrorCard";
import Loading from "./Loading";
import NoResultsCard from "./NoResultsCard";
import NoSearchCard from "./NoSearchCard";
import CardGrid from "./CardGrid";
import "../index.css";

export default function AppLayout({ handleSearch, cities, error, loading }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Full viewport height
      }}
    >
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1, // Takes up remaining space
          display: "flex",
          flexDirection: "column",
          p: 2, // Optional padding for main content
          margin: "20px auto",
        }}
      >
        {cities?.length === 0 && <NoResultsCard />}
        {error && <ErrorCard />}
        {!loading && !cities && !error && <NoSearchCard />}
        {loading && <Loading />}
        {cities && !loading && (
          <Grid container spacing={2}>
            <CardGrid cities={cities} />
          </Grid>
        )}
      </Box>
      {/* Footer */}
      <Footer />
    </Box>
  );
}
