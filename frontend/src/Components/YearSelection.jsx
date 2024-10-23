import { useEffect, useState } from "react";
import { getYears } from "../API/server";
import { Button, Dropdown, Space } from "antd";

const YearSelection = ({
  selectedYear,
  setMapConfiguration,
  setCurrentStep,
}) => {
  const [menuItems, setMenuItems, mapConfiguration] = useState([]);

  useEffect(() => {
    getYearList();
  }, []);

  //#region methods
  const getYearList = async () => {
    const data = await getYears();
    const yearsList = data.years.sort().map((el, i) => ({
      key: i,
      label: el,
    }));
    setMenuItems(yearsList);
  };

  const handleYearSelection = (e) => {
    setMapConfiguration({
      ...mapConfiguration,
      selectedYear: menuItems[e].label,
    });
    setCurrentStep(1);
  };

  const menuProps = {
    items: menuItems,
    onClick: (e) => handleYearSelection(e.key),
  };
  //#endregion

  return (
    <div
      style={{ display: "flex", margin: "100px 0", justifyContent: "center" }}
    >
      <Dropdown menu={menuProps}>
        <Button>
          <Space>{selectedYear ? selectedYear : "Select Year"}</Space>
        </Button>
      </Dropdown>
    </div>
  );
};

export default YearSelection;
