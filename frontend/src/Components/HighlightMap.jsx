import { useEffect, useRef, useState } from "react";
import {
  downloadData,
  getHighlightedMapData,
  getMapData,
  uploadFile,
} from "../API/server";
import { Button, Col, message, Row, Spin } from "antd";
import parse from "html-react-parser";
const HighlightMap = ({
  selectedYear,
  setMapConfiguration,
  setCurrentStep,
  mapConfiguration,
}) => {
  const [mapHtml, setMapHtml] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const uploadFileRef = useRef();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getMasterMapData();
  }, []);

  //#region Methods
  const handleFileSelection = async (e) => {
    const file = e.target.files[0];
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

  //#endregion
  const getMasterMapData = async () => {
    setIsLoading(true);
    const res = await getMapData(selectedYear);
    const masterData = JSON.parse(res.masterData);
    const mapHtml = res.folium_map_html;
    setMapHtml(mapHtml);

    setMapConfiguration({
      ...mapConfiguration,
      masterData: masterData,
    });

    setIsLoading(false);
  };

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
          alignContent: "flex-start",
          alignItems: "center",
          padding: "20px 20px",
        }}
      >
        {contextHolder}
        <Col span={16} style={{ height: "500px", overflow: "hidden" }}>
          {parse(mapHtml ? mapHtml : "")}
        </Col>
        <Col span={8} style={{ padding: "20px 40px" }}>
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
            <Col span={12}>
              <Button type="primary" onClick={() => setCurrentStep(2)}>
                Highlight
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" onClick={() => setCurrentStep(0)}>
                Reset
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default HighlightMap;
