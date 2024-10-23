import parse from "html-react-parser";
import { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { Col, Row } from "antd";
import { BarChart } from "@mui/x-charts";

const LineGraphs = ({ masterGraphData }) => {
  const [graphData, setGraphData] = useState(masterGraphData);
  const [aqiGraph, setAqiGraph] = useState({
    xAxisData: [],
    yAxisData: { data: [] },
  });
  const [pmGraph, setPmGraph] = useState({
    xAxisData: [],
    yAxisData: { data: [] },
  });
  console.log("Graph data", graphData);

  const transformPmData = (data) => {
    const xAxis = data.map((row) => row.city);
    const yNo2 = data.map((row) => row.no2_concentration);
    const yPm10 = data.map((row) => row.pm10_concentration);
    const yPMm25 = data.map((row) => row.pm25_concentration);

    setPmGraph({
      ...aqiGraph,
      xAxisData: xAxis,
      yAxisData: [
        { label: "no2", data: yNo2 },
        { label: "pm10", data: yPm10 },
        { label: "pm25", data: yPMm25 },
      ],
    });
  };

  // const transformAQIData = (data) => {
  //   const xAxis = data.map((row) => row.city);
  //   const yAxis = data.map((row) => row.aqi_level);

  //   setAqiGraph({
  //     ...aqiGraph,
  //     xAxisData: xAxis,
  //     yAxisData: { data: yAxis, label: "AQI Level" },
  //   });
  // };

  useEffect(() => {
    // transformAQIData(graphData);
    const slicedData = graphData;
    transformPmData(slicedData);
  }, [masterGraphData]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "30px 0 10px 0",
      }}
    >
      <Row>
        <Col span={24}>
          {pmGraph.xAxisData && pmGraph.xAxisData.length > 0 ? (
            <BarChart
              xAxis={[{ scaleType: "band", data: pmGraph.xAxisData }]}
              series={pmGraph.yAxisData}
              height={500}
              width={1000}
            />
          ) : null}
        </Col>
      </Row>
    </div>
  );
};

export default LineGraphs;
