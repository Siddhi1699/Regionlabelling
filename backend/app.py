from flask import Flask, render_template, request, jsonify
from markupsafe import Markup
import pandas as pd
from flask_cors import CORS
from shapely.geometry import Polygon
import warnings, util
import os
import json

warnings.simplefilter(action="ignore", category=FutureWarning)

app = Flask(__name__)
CORS(app)
data = pd.read_csv("final dataset.csv")

'''
@app.route("/", methods=["GET"])
def index():

    return render_template("aqi.html")
'''

@app.route("/years", methods=["GET"])
def getYears():
    uniqueYears = data["year"].unique()
    print(uniqueYears)
    return jsonify({"years": uniqueYears.tolist()})


@app.route("/masterData", methods=["POST"])
def home():
    location = [0, 0]

    print("Selected year: ", request.json["year"])
    selectedYear = request.json["year"]
    filtered_data = data[data.year == selectedYear]
    # dropdown_cities = filtered_data["city"].unique()

    print("Filtered Data: ", filtered_data)
    folium_map_html = util.create_folium_map(location, filtered_data)
    # plotly_map_html = util.plotly_map(filtered_data)
    # linechart_html = util.linecharts(data=filtered_data)

    return jsonify(
        {
            "masterData": filtered_data.to_json(orient="records"),
            "folium_map_html": Markup(folium_map_html),
            # "plotly_map_html": Markup(plotly_map_html),
            # "lineChart_html": Markup(linechart_html),
        }
    )
    # return render_template('index.html', dropdown_options= dropdown_options,
    #                        folium_map_html=Markup(folium_map_html),
    #                        plotly_map_html= Markup(plotly_map_html),
    #                        linechart_html= Markup(linechart_html))


@app.route("/highlighted", methods=["GET", "POST"])
def highlighted():

    # Default map location
    location = [0, 0]
    selectedYear = request.json["year"]
    newDataString = request.json["data"]
    showOverlay = request.json["showOverlay"]
    jsonData = json.loads(newDataString)
    updatedDF = pd.json_normalize(jsonData)

    file_path = "./data.geojson"
    geojson_data = util.load_geojson(file_path)

    polygon_coords = geojson_data["features"][0]["geometry"]["coordinates"][0]
    polygon = Polygon(polygon_coords)
    dataFilteredByYear = updatedDF[updatedDF.year == selectedYear]
    dataFilteredByYear["within_polygon"] = dataFilteredByYear.apply(
        lambda row: util.is_within_polygon(row["latitude"], row["longitude"], polygon),
        axis=1,
    )

    filtered_data = dataFilteredByYear[dataFilteredByYear["within_polygon"]].drop(
        columns=["within_polygon"]
    )

    location = [filtered_data.iloc[0].latitude, filtered_data.iloc[0].longitude]
    folium_map_html = util.hightlight_folium_map(
        data=filtered_data, location=location, geodata=geojson_data, overlay=showOverlay
    )

    dropdown_cityOptions = filtered_data.city.unique()

    return jsonify(
        {
            "filteredData": filtered_data.to_json(orient="records"),
            "dropdown_cities": dropdown_cityOptions.tolist(),
            "folium_map_html": Markup(folium_map_html),
        }
    )


@app.route("/uploadFile", methods=["POST"])
def uploadFile():
    try:
        file = request.files["file"]
        file.save(os.path.join("data.csv"))
        return jsonify({"res": 200})
    except Exception as e:
        return jsonify({"res": 500})


@app.route("/downloadFile", methods=["POST"])
def downloadFile():
    try:
        jsonDataString = request.json["jsonData"]
        jsonData = json.loads(jsonDataString)
        df = pd.json_normalize(jsonData)
        print(df.head(10))
        df.to_csv(os.path.join("data.csv"), index=False)
        return jsonify({"res": 200})
    except Exception as e:
        print(e)
        return jsonify({"res": 500})


@app.route("/suggestLabel", methods=["POST"])
def suggestLabel():
    try:
        cityName = request.json["city"]
        year = request.json["year"]
        filteredData = data[data.year == year]
        newAQI, nn_list = util.compute_new_aqi(city_name=cityName, df=filteredData)

        return jsonify({"newAQI": newAQI, "nn_list": nn_list, "res": 200})
    except Exception as e:
        print("exception", e)
        return jsonify({"res": 500})


@app.route("/updateHighlightedMap", methods=["GET", "POST"])
def updateHighlightedMap():

    # Default map location
    location = [0, 0]
    selectedYear = request.json["year"]
    selectedCity = request.json["city"]
    newDataString = request.json["data"]
    jsonData = json.loads(newDataString)
    updatedDF = pd.json_normalize(jsonData)

    file_path = "./data.geojson"
    geojson_data = util.load_geojson(file_path)

    polygon_coords = geojson_data["features"][0]["geometry"]["coordinates"][0]
    polygon = Polygon(polygon_coords)
    dataFilteredByYear = updatedDF[updatedDF.year == selectedYear]
    dataFilteredByYear["within_polygon"] = dataFilteredByYear.apply(
        lambda row: util.is_within_polygon(row["latitude"], row["longitude"], polygon),
        axis=1,
    )

    filtered_data = dataFilteredByYear[dataFilteredByYear["within_polygon"]].drop(
        columns=["within_polygon"]
    )

    location = [filtered_data.iloc[0].latitude, filtered_data.iloc[0].longitude]
    folium_map_html = util.hightlight_folium_map(
        data=filtered_data,
        location=location,
        geodata=geojson_data,
        city=selectedCity,
        overlay=True,
    )

    dropdown_cityOptions = filtered_data.city.unique()

    return jsonify(
        {
            "folium_map_html": Markup(folium_map_html),
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
