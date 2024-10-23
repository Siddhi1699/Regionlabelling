import { Button } from "antd";
import "../Styles/coverStyle.css";

const Cover = ({ setShowApp }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        height: "100vh",
        width: "100vw",
        margin: 0,
        backgroundColor: "black",
      }}
    >
      <div style={{ textAlign: "center", paddingTop: "20px" }}>
        <h1
          style={{ color: "white", fontSize: "2.5rem", marginBottom: "20px" }}
        >
          REGION LABELING
        </h1>

        <div style={{ marginBottom: "30px", color: "white" }}>
          <h2>AQI Categories</h2>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "20px",
              borderRadius: "10px",
              color: "white",
              margin: "10px auto",
              maxWidth: "1400px",
              height: "110px",
              textAlign: "center",
            }}
          >
            <p>
              Air Quality Index (AQI) is like a yardstick that runs from 0-500.
              The higher the AQI value, higher is the air pollution level and
              higher is the health concern. The AQI is divided into 6 categories
              corresponding to a different level of health concern; represented
              by a color. This application uses the concentration levels of 3
              pollutants (PM2.5, PM10 and NO2) to determine AQI of a location.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <div className="circle green">
            <div className="category-number">1</div>
            <div className="category-name">Good</div>
            <div className="category-description">
              Air quality is considered satisfactory.
            </div>
          </div>
          <div className="circle yellow">
            <div className="category-number">2</div>
            <div className="category-name">Moderate</div>
            <div className="category-description">
              Air quality is acceptable; some pollutants may be a concern.
            </div>
          </div>
          <div className="circle orange">
            <div className="category-number">3</div>
            <div className="category-name">Unhealthy for Sensitive Groups</div>
            <div className="category-description">
              Sensitive groups may experience health effects.
            </div>
          </div>
          <div className="circle red">
            <div className="category-number">4</div>
            <div className="category-name">Unhealthy</div>
            <div className="category-description">
              Everyone may begin to experience health effects.
            </div>
          </div>
          <div className="circle purple">
            <div className="category-number">5</div>
            <div className="category-name">Very Unhealthy</div>
            <div className="category-description">
              Health alert; everyone may experience serious health effects.
            </div>
          </div>
          <div className="circle maroon">
            <div className="category-number">6</div>
            <div className="category-name">Hazardous</div>
            <div className="category-description">
              Health warning of emergency conditions.
            </div>
          </div>
        </div>

        <Button
          style={{ margin: "50px 0" }}
          type="primary"
          onClick={() => setShowApp(true)}
        >
          Start
        </Button>
      </div>
    </div>
  );
};

export default Cover;
