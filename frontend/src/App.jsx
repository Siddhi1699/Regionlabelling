import { useState } from "react";
import Cover from "./Components/Cover";
// import WorldMap from "./Components/WorldMap";
// import LineGraphs from "./Components/LineGraphs";
// import PlotlyMap from "./Components/PlotlyMap";
// import { Spin } from "antd";
import GlobalStyles from "./Styles/GlobalStyle";
import WorldMap from "./Components/WorldMap";

const App = () => {
  const [showApp, setShowApp] = useState(false);

  return (
    <>
      <GlobalStyles />

      {showApp ? <WorldMap /> : <Cover setShowApp={setShowApp} />}
      {/* <WorldMap
        selectedCity={selectedCity}
        selectedYear={selectedYear}
        setSelectedCity={setSelectedCity}
        setSelectedYear={setSelectedYear}
        setPlotlyChart={setPlotlyChart}
        setLineChart={setLineChart}
        setGraphData={setGraphData}
      />
      {selectedCity ? (
        <LineGraphs masterGraphData={graphData} selectedCity={selectedCity} />
      ) : null}
      <PlotlyMap plotlyChart={plotlyChart} /> */}
    </>
  );
};

export default App;
