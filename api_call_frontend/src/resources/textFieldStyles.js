export const textFieldStyles = {
  flex: "1 1 auto",
  marginRight: 2,
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
  },
  "& .MuiOutlinedInput-root": {
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&.Mui-focused": {
      backgroundColor: "transparent",
    },
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiAutocomplete-popper": {
    backgroundColor: "transparent",
  },
  "& .MuiAutocomplete-option": {
    backgroundColor: "transparent",
    color: "white",
  },
  "& .MuiAutocomplete-option.Mui-focused": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "& .MuiAutocomplete-option.Mui-selected": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
};
