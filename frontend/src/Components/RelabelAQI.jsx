import {
  Button,
  Card,
  Col,
  Dropdown,
  message,
  notification,
  Popover,
  Row,
  Slider,
  Space,
  Spin,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  downloadData,
  getHighlightedMapData,
  getHighlightedMapDataWithUpdatedMarker,
  getSuggestLabelAQI,
  uploadFile,
} from "../API/server";
import parse from "html-react-parser";
import { getCategoryByAQI } from "../Utility/DataFormat";
import InfoCircleFilled from "@ant-design/icons/lib/icons/InfoCircleFilled";

const RelabelAQI = ({
  selectedYear,
  selectedCity,
  setMapConfiguration,
  setCurrentStep,
  mapConfiguration,
}) => {
  const [mapHtml, setMapHtml] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const uploadFileRef = useRef();
  const [messageApi, contextHolder] = message.useMessage();
  const [api, contextHolderNotification] = notification.useNotification();
  const ActiveButton = {
    REMOVE_LABEL: "REMOVE_LABEL",
    RELABEL_CITY: "RELABEL_CITY",
    SUGGEST_RELABEL: "SUGGEST_RELABEL",
    RELABEL_ALL_CITIES: "RELABEL_ALL_CITIES",
    NONE: "None",
  };

  const isCitAndYearSelected = !selectedCity || !selectedYear;
  const [activeButtonSelection, setActiveButtonSelection] = useState(
    ActiveButton.NONE
  );
  const [oldAQIValue, setOldAQIValue] = useState(null);
  const [aqiValue, setAqiValue] = useState(0);
  const [suggestedAQI, setSuggestedAQI] = useState({ value: 0, nn: [] });

  useEffect(() => {
    getMapDataOfHighlightedRegion();
  }, []);

  //#region Methods
  const handleFileSelection = async (e) => {
    const file = e.target.files[0];
    console.log("File", file);
    const res = await uploadFile(file);

    if (res.data.res === 200)
      messageApi.open({
        type: "success",
        content: "File uploaded successfully.",
      });
    else
      messageApi.open({
        type: "error",
        content: "Failed to upload the file.",
      });
  };

  const onSelectFileButtonClick = () => {
    uploadFileRef.current.click();
  };

  const handleDownload = async () => {
    const jsonData = mapConfiguration.masterData;
    const res = await downloadData(jsonData);
    if (res.data.res === 200)
      messageApi.open({
        type: "success",
        content: "File downloaded successfully.",
      });
    else
      messageApi.open({
        type: "error",
        content: "Failed to download the file.",
      });
  };
  const getMapDataOfHighlightedRegion = async (showOverlay = false) => {
    setIsLoading(true);
    var mapRes = await getHighlightedMapData(
      selectedYear,
      mapConfiguration.masterData,
      showOverlay
    );
    // console.log("After selecting region in map", mapRes);
    const citiesList = mapRes.dropdown_cities.map((city, i) => ({
      key: i,
      label: city,
    }));
    setCityOptions(citiesList);
    setMapHtml(mapRes.folium_map_html);
    const filteredData = JSON.parse(mapRes.filteredData);
    setMapConfiguration({
      ...mapConfiguration,
      filteredData: filteredData,
    });

    setIsLoading(false);
  };

  const getSuggestLabelData = async (year, cityName) => {
    const res = await getSuggestLabelAQI(year, cityName);

    setSuggestedAQI({ ...suggestedAQI, value: res.newAQI, nn: res.nn_list });
  };

  const openNotificationWithIcon = (type, aqiValue) => {
    api[type]({
      message: "AQI Information",
      description: `The marked region has overall AQI of ${aqiValue} and falls into the ${getCategoryByAQI(
        aqiValue
      )} category`,
    });
  };
  const handleCitySelection = (e) => {
    selectedCity = cityOptions[e].label;

    if (selectedCity && selectedYear) {
      const selectedCityData = mapConfiguration.filteredData.filter(
        (row) => row.city === selectedCity
      );
      if (selectedCityData.length === 0)
        messageApi.open({
          type: "error",
          content: `No data AQI available for ${selectedCity} in ${selectedYear}.`,
        });
      else {
        getSuggestLabelData(selectedYear, selectedCity);
        setOldAQIValue(selectedCityData[0].aqi_level);
        setAqiValue(selectedCityData[0].aqi_level);
        openNotificationWithIcon("info", selectedCityData[0].aqi_level);
      }
    }

    setMapConfiguration({
      ...mapConfiguration,
      selectedCity: cityOptions[e].label,
    });
  };

  const getUpdatedMap = async () => {
    const updatedMapData = await getHighlightedMapDataWithUpdatedMarker(
      selectedYear,
      selectedCity,
      mapConfiguration.masterData
    );

    setMapHtml(updatedMapData.folium_map_html);
  };
  const handleUpdateMasterData = (actionType, aqiValue) => {
    if (actionType === ActiveButton.RELABEL_ALL_CITIES) {
      const cityList = new Set(cityOptions.map((city) => city.label));

      var newMasterData = mapConfiguration.masterData.map((row) => {
        if (cityList.has(row.city) && row.year === selectedYear) {
          row.aqi_level = aqiValue;
        }
        return row;
      });

      var newFilteredData = mapConfiguration.filteredData.map((row) => {
        if (cityList.has(row.city) && row.year === selectedYear) {
          row.aqi_level = aqiValue;
        }
        return row;
      });

      messageApi.open({
        type: "success",
        content: `AQI Updated for all marked regions as ${aqiValue}`,
      });

      setMapConfiguration({
        ...mapConfiguration,
        masterData: newMasterData,
        filteredData: newFilteredData,
        selectedCity: null,
      });

      //   setGraphData(newMasterData);

      // setSelectedCity(null);
      // setSelectedYear(null);

      getMapDataOfHighlightedRegion(true);
    } else {
      var newMasterData = mapConfiguration.masterData.map((row) => {
        if (row.city === selectedCity && row.year === selectedYear)
          row.aqi_level =
            actionType === ActiveButton.SUGGEST_RELABEL
              ? suggestedAQI.value
              : aqiValue;
        return row;
      });

      var newFilteredData = mapConfiguration.filteredData.map((row) => {
        if (row.city === selectedCity && row.year === selectedYear)
          row.aqi_level =
            actionType === ActiveButton.SUGGEST_RELABEL
              ? suggestedAQI.value
              : aqiValue;
        return row;
      });

      messageApi.open({
        type: "success",
        content: `AQI Updated for ${selectedCity} as ${
          actionType === ActiveButton.SUGGEST_RELABEL
              ? suggestedAQI.value
              : aqiValue
        }`,
      });
      setMapConfiguration({
        ...mapConfiguration,
        masterData: newMasterData,
        filteredData: newFilteredData,
        selectedCity: null,
      });
      getUpdatedMap();

      //   setGraphData(newMasterData);
      // setSelectedCity(null);
      // setSelectedYear(null);
    }
  };
  const menuProps = {
    items: cityOptions,
    onClick: (e) => handleCitySelection(e.key),
  };
  //#endregion

  //#region Spinner
  if (isLoading)
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  //#endregion

  return (
    <>
      <Row
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        {contextHolder}
        {contextHolderNotification}
        {/* ---------------------------------- Map ----------------------------------*/}
        <Col span={16}>{parse(mapHtml ? mapHtml : "")}</Col>
        <Col span={8} style={{ padding: "10px 30px" }}>
          {/* ---------------------------------- City ----------------------------------*/}
          <Card
            title="Relabel AQI"
            bordered={false}
            style={{
              width: "100%",
              margin: "20px 0",
            }}
          >
            <Row style={{ marginBottom: "10px", display: "flex" }}>
              <Col span={12}>City</Col>
              <Col span={12}>
                <Dropdown menu={menuProps}>
                  <Button>
                    <Space>{selectedCity ? selectedCity : "Select City"}</Space>
                  </Button>
                </Dropdown>
              </Col>
            </Row>
            {/* ---------------------------------- Relabel Buttons ----------------------------------*/}
            <Row style={{ marginBottom: "10px", display: "flex" }}>
              <Col span={12}>
                <Button
                  type="primary"
                  disabled={isCitAndYearSelected}
                  onClick={() => {
                    setActiveButtonSelection(ActiveButton.REMOVE_LABEL);
                    setAqiValue(0);
                  }}
                >
                  Remove Label
                </Button>
                {activeButtonSelection === ActiveButton.REMOVE_LABEL ? (
                  <b>
                    <br />
                    AQI: {aqiValue}
                  </b>
                ) : null}
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  onClick={() =>
                    setActiveButtonSelection(ActiveButton.RELABEL_CITY)
                  }
                  disabled={isCitAndYearSelected}
                >
                  Relabel (City)
                </Button>
                {activeButtonSelection === ActiveButton.RELABEL_CITY ? (
                  <Slider
                    min={1}
                    max={6}
                    onChange={(val) => setAqiValue(val)}
                    value={aqiValue}
                  />
                ) : null}
              </Col>
            </Row>
            <Row style={{ marginBottom: "10px", display: "flex" }}>
              <Col span={12}>
                <Button
                  type="primary"
                  disabled={isCitAndYearSelected}
                  onClick={() =>
                    setActiveButtonSelection(ActiveButton.SUGGEST_RELABEL)
                  }
                >
                  Suggest Label
                </Button>

                {activeButtonSelection === ActiveButton.SUGGEST_RELABEL ? (
                  <div>
                    New AQI: <b>{suggestedAQI.value}</b>
                    <Popover
                      content={
                        <div>
                          {suggestedAQI.nn.map((val, i) => (
                            <p key={i}>{val}</p>
                          ))}
                        </div>
                      }
                      title="Neighbors"
                      trigger="hover"
                    >
                      <Button
                        style={{ margin: " 5px 10px", fontSize: "5px" }}
                        type="primary"
                        shape="circle"
                        icon={<InfoCircleFilled />}
                      />
                    </Popover>
                  </div>
                ) : null}
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  onClick={() => {
                    setActiveButtonSelection(ActiveButton.RELABEL_ALL_CITIES);
                  }}
                >
                  Relabel (Region)
                </Button>
                {activeButtonSelection === ActiveButton.RELABEL_ALL_CITIES ? (
                  <Slider
                    min={1}
                    max={6}
                    onChange={(val) => setAqiValue(val)}
                    value={aqiValue}
                  />
                ) : null}
              </Col>
              <Row style={{ margin: "10px 0", display: "flex" }}>
                <Col span={24}>
                  <Button
                    type="primary"
                    onClick={() => {
                      handleUpdateMasterData(
                        activeButtonSelection,
                        aqiValue,
                        selectedCity,
                        selectedYear
                      );
                      setActiveButtonSelection(ActiveButton.NONE);
                    }}
                  >
                    Submit
                  </Button>
                </Col>
              </Row>
            </Row>
          </Card>
          {/* ---------------------------------- Fixed Buttons ----------------------------------*/}
          <Card
            title="Options"
            bordered={false}
            style={{
              width: "100%",
              margin: "0 0 10px 0",
            }}
          >
            <Row style={{ marginBottom: "10px" }}>
              <Col span={12}>
                <input
                  type="file"
                  id="file"
                  ref={uploadFileRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelection}
                />
                <Button type="dark" onClick={onSelectFileButtonClick}>
                  Upload File
                </Button>
              </Col>
              <Col span={12}>
                <Button type="primary" onClick={handleDownload}>
                  Download File
                </Button>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Button type="primary" onClick={() => setCurrentStep(0)}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default RelabelAQI;
