export const getCategoryByAQI = (aqi) => {
  switch (aqi) {
    case 1:
      return "Very Good";
    case 2:
      return "Good";
    case 3:
      return "Moderate";
    case 4:
      return "Poor";
    case 5:
      return "Very Poor";
    case 6:
      return "Extremely Poor";

    default:
      return "NA";
  }
};
