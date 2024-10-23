import axios from "axios";
import { ENV } from "../env";

export const getMapData = async (selectedYear) => {
  const res = await axios.post(`${ENV.SERVER_BASE_URL}/masterData`, {
    year: selectedYear,
  });
  return res.data;
};

export const getHighlightedMapData = async (
  selectedYear,
  dataForDf,
  showOverlay
) => {
  const res = await axios.post(`${ENV.SERVER_BASE_URL}/highlighted`, {
    year: selectedYear,
    data: JSON.stringify(dataForDf),
    showOverlay: showOverlay,
  });
  return res.data;
};

export const getHighlightedMapDataWithUpdatedMarker = async (
  selectedYear,
  selectedCity,
  dataForDf
) => {
  const res = await axios.post(`${ENV.SERVER_BASE_URL}/updateHighlightedMap`, {
    year: selectedYear,
    city: selectedCity,
    data: JSON.stringify(dataForDf),
  });
  return res.data;
};
export const getSuggestLabelAQI = async (selectedYear, selectedCity) => {
  const res = await axios.post(`${ENV.SERVER_BASE_URL}/suggestLabel`, {
    year: selectedYear,
    city: selectedCity,
  });
  return res.data;
};

export const uploadFile = async (file) => {
  let formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(`${ENV.SERVER_BASE_URL}/uploadFile`, formData);
  return res;
};

export const downloadData = async (jsonData) => {
  const res = await axios.post(`${ENV.SERVER_BASE_URL}/downloadFile`, {
    jsonData: JSON.stringify(jsonData),
  });
  return res;
};

export const getYears = async () => {
  const res = await axios.get(`${ENV.SERVER_BASE_URL}/years`);
  return res.data;
};
