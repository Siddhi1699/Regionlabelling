import { Steps } from "antd";
import { useRef, useState } from "react";
import YearSelection from "./YearSelection";
import HighlightMap from "./HighlightMap";
import RelabelAQI from "./RelabelAQI";
import LineGraphs from "./LineGraphs";
import Instructions from "./Instructions";

const steps = [
  {
    title: "Select Year",
    description: "Select year from options.",
  },
  {
    title: "Highlight",
    description: " Highlight a region in map",
  },
  {
    title: "Relabel",
    description: "Relabel AQI Values of selected region(s).",
  },
];

const WorldMap = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const [mapConfiguration, setMapConfiguration] = useState({
    selectedYear: null,
    selectedCity: null,
    isMapHighlighted: false,
    masterData: [],
    filteredData: [],
  });

  const getComponentToRender = () => {
    switch (currentStep) {
      case 0:
        return (
          <YearSelection
            selectedYear={mapConfiguration.selectedYear}
            setMapConfiguration={setMapConfiguration}
            setCurrentStep={setCurrentStep}
            mapConfiguration={mapConfiguration}
          />
        );

      case 1:
        return (
          <HighlightMap
            selectedYear={mapConfiguration.selectedYear}
            mapConfiguration={mapConfiguration}
            setMapConfiguration={setMapConfiguration}
            setCurrentStep={setCurrentStep}
          />
        );

      case 2:
        return (
          <RelabelAQI
            selectedYear={mapConfiguration.selectedYear}
            mapConfiguration={mapConfiguration}
            setMapConfiguration={setMapConfiguration}
            setCurrentStep={setCurrentStep}
            selectedCity={mapConfiguration.selectedCity}
          />
        );

      default:
        return <h1>Something went wrong</h1>;
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Steps
        current={currentStep}
        items={steps}
        style={{ padding: "0 10px" }}
      />

      <Instructions
        isModalOpen={showInstructions}
        setIsModalOpen={setShowInstructions}
      />

      <div style={{ width: "100%", height: "100%", margin: "20px 20px" }}>
        {getComponentToRender(currentStep)}
      </div>
      {currentStep === 2 &&
      mapConfiguration.filteredData &&
      mapConfiguration.filteredData.length > 0 ? (
        <div style={{ width: "100%", height: "100%", display: "flex" }}>
          <LineGraphs masterGraphData={mapConfiguration.filteredData} />
        </div>
      ) : null}
    </div>
  );
};

export default WorldMap;
