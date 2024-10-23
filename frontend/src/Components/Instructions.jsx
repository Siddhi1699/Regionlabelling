import { Button, FloatButton, Modal } from "antd";
import { QuestionCircleFilled } from "@ant-design/icons";

const Instructions = ({ isModalOpen, setIsModalOpen }) => {
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <FloatButton
        onClick={showModal}
        shape="circle"
        type="primary"
        style={{}}
        icon={<QuestionCircleFilled />}
      />
      <Modal
        title="Instructions"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
      >
        <div style={{ textAlign: "left", padding: "10px 15px" }}>
          <ol>
            <li>
              The map shows overall AQI of world. Please select a year from the
              “Select Year” dropdown.
            </li>
            <li>Please mark a region using the toolbox and press submit.</li>
            <li>Hover over a marker to read AQI information of the city.</li>
            <li>Please select a city from the “Select City” dropdown.</li>
            <li>
              Click on “Remove label” button to remove the AQI of selected city
              (i.e. set AQI to 0)
            </li>
            <li>
              Click on “Relabel” button to assign new AQI to selected city.
            </li>
            <li>
              Click on “Suggest label” button to get AQI level suggestion from
              system for selected city.
            </li>
            <li>
              Click on “Relabel Region” button to assign new label to marked
              region.
            </li>
            <li>Click on “Download” to download the updated data.</li>
          </ol>
        </div>
      </Modal>
    </>
  );
};

export default Instructions;
