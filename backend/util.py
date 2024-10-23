import pandas as pd
import folium
import json, geojson
from folium import plugins
import plotly.express as px
from shapely.geometry import Point
import seaborn as sns
import matplotlib.pyplot as plt
import io, base64, matplotlib
from scipy.spatial import distance
import math

matplotlib.use("agg")


## initial folium map
def create_folium_map(location, data):
    m = folium.Map(location=location, zoom_start=7)
    data_heatmap = data.dropna(subset=["latitude", "longitude", "aqi_level"])
    heat_data = data_heatmap[["latitude", "longitude", "aqi_level"]].values.tolist()
    hm = plugins.HeatMap(
        heat_data, min_opacity=0.05, max_opacity=0.9, radius=20
    ).add_to(m)
    plugins.Draw(
        draw_options={
            "polyline": False,
            "rectangle": True,
            "polygon": True,
            "circle": False,
            "marker": False,
            "circlemarker": False,
        },
        edit_options={"edit": True},
        export=True,
    ).add_to(m)
    return m._repr_html_()


## plotly map
def plotly_map(data):
    fig = px.choropleth(
        data,
        locations="country_name",
        locationmode="country names",
        color="aqi_category",
        animation_frame="year",
        range_color=[25, 450],
    )

    return fig.to_html()


## dropdown options
def get_dropdown_options(data):

    return {"cities": data["city"].unique(), "years": data["year"].unique()}


## geojson file
def load_geojson(file_path):
    # Load the GeoJSON file using json module
    with open(file_path, "r") as geojson_file:
        data = json.load(geojson_file)
    # Optionally, load the GeoJSON file using geojson module
    geojson_data = geojson.loads(json.dumps(data))
    return geojson_data


def is_within_polygon(lat, long, polygon):
    point = Point(long, lat)
    return polygon.contains(point)


## highlighted folium map
def hightlight_folium_map(data, location, geodata, city=None, overlay=False):
    m = folium.Map(location=location, zoom_start=3)
    data_heatmap = data.dropna(subset=["latitude", "longitude", "aqi_level"])
    heat_data = data_heatmap[["latitude", "longitude", "aqi_level"]].values.tolist()
    hm = plugins.HeatMap(
        heat_data, min_opacity=0.05, max_opacity=0.9, radius=20
    ).add_to(m)

    plugins.Draw(
        draw_options={
            "polyline": False,
            "rectangle": True,
            "polygon": True,
            "circle": False,
            "marker": False,
            "circlemarker": False,
        },
        edit_options={"edit": True},
        export=True,
    ).add_to(m)
    selected_aqi = []
    for idx, row in data.iterrows():
        lat = row["latitude"]
        lon = row["longitude"]
        aqi = row["aqi_level"]
        pm10 = row["pm10_imputed"]
        pm25 = row["pm25_imputed"]
        no2 = row["no2_imputed"]
        cityName = row["city"]
        selected_aqi.append(aqi)
        if row["city"] == city:
            icon_type = "flag"
        else:
            icon_type = "info-sign"

        pop_color = getColorByAQI(aqi)
        folium.Marker(
            location=[lat, lon],
            popup=f"City: {cityName} AQI: {aqi}  PM10 Imputed: {pm10}  PM25 Imputed: {pm25} NO2 Imputed: {no2}",
            tooltip=f"City: {cityName} AQI:{aqi}  PM10 Imputed:{pm10}  PM25 Imputed:{pm25} NO2 Imputed:{no2}",
            icon=folium.Icon(color=pop_color, icon=icon_type),
        ).add_to(m)
    if overlay:
        mean_aqi = sum(selected_aqi) / len(selected_aqi)
        print("Mean AQI: ", mean_aqi)
        folium.GeoJson(
            data=geodata,
            style_function=lambda feature: {
                "fillColor": getColorByAQI(math.floor(mean_aqi)),
                "color": getColorByAQI(math.floor(mean_aqi)),
            },
        ).add_to(m)
    return m._repr_html_()



# Style function for non-highlighted state
def style_function(feature):
    return {
        "fillColor": "#228B22",  # Green color
        "color": "#228B22",  # Green border
        "weight": 2,
        "fillOpacity": 0.5,
    }


# Style function for highlighted state
def highlight_function(feature):
    return {
        "fillColor": "#ff0000",  # Red color
        "color": "#ff0000",  # Red border
        "weight": 3,
        "fillOpacity": 0.7,
    }


def layer_folium_map(data, location, geodata):
    m = folium.map(location=[0, 0], zoom_start=3)
    # data_heatmap= data.dropna(subset=['latitude', 'longitude', 'aqi_level'])
    # heat_data = data_heatmap[['latitude', 'longitude', 'aqi_level']].values.tolist()
    # hm = plugins.HeatMap(heat_data, min_opacity=0.05, max_opacity = 0.9, radius = 20).add_to(m)
    # plugins.Draw(draw_options={
    #             'polyline':False,
    #             'rectangle':True,
    #             'polygon':True,
    #             'circle':False,
    #             'marker':False,
    #             'circlemarker':False},
    #         edit_options={'edit':True},export= True).add_to(m)
    folium.GeoJson(
        geodata, style_function=style_function, highlight_function=highlight_function
    ).add_to(m)
    # folium.Popup('Highlighted Polygon').add_to(geojson)
    return m._repr_html_()


def calc_aqi(p1, p2, p3):
    aqilist = []
    if p1 <= 20:
        aqilist.append(1)
    elif p1 <= 40:
        aqilist.append(2)
    elif p1 <= 500:
        aqilist.append(3)
    elif p1 <= 100:
        aqilist.append(4)
    elif p1 <= 150:
        aqilist.append(5)
    elif p1 <= 1200:
        aqilist.append(6)
    if p2 <= 10:
        aqilist.append(1)
    elif p2 <= 20:
        aqilist.append(2)
    elif p2 <= 25:
        aqilist.append(3)
    elif p2 <= 50:
        aqilist.append(4)
    elif p2 <= 75:
        aqilist.append(5)
    elif p2 <= 800:
        aqilist.append(6)
    if p3 <= 40:
        aqilist.append(1)
    elif p3 <= 90:
        aqilist.append(2)
    elif p3 <= 120:
        aqilist.append(3)
    elif p3 <= 230:
        aqilist.append(4)
    elif p3 <= 340:
        aqilist.append(5)
    elif p3 <= 1000:
        aqilist.append(6)

    return max(aqilist)


def compute_new_aqi(city_name, df, k=3):
    # Get the selected city’s data
    selected_city = df[df["city"] == city_name].iloc[0]
    selected_point = (selected_city["longitude"], selected_city["latitude"])

    # Compute distances between the selected city and all other cities
    df["distance"] = df.apply(
        lambda row: distance.euclidean(
            selected_point, (row["longitude"], row["latitude"])
        ),
        axis=1,
    )

    # Exclude the selected city itself
    neighbors_df = df[df["city"] != city_name]

    # Get the k nearest neighbors
    nearest_neighbors = neighbors_df.nsmallest(k, "distance")

    # Compute the mean of the pollutant values of the nearest neighbors
    mean_pm10_value = nearest_neighbors["pm10_concentration"].mean()
    mean_pm25_value = nearest_neighbors["pm25_concentration"].mean()
    mean_no2_value = nearest_neighbors["no2_concentration"].mean()

    # Calculate the new AQI level for the selected city
    new_aqi_level = calc_aqi(mean_pm10_value, mean_pm25_value, mean_no2_value)
    # new_category = aqi_category_mapping[region_aqi_level]

    return new_aqi_level, nearest_neighbors["city"].unique().tolist()


def getColorByAQI(aqi_value):
    if aqi_value == 1:
        return "green"
    elif aqi_value == 2:
        return "beige"
    elif aqi_value == 0:
        return "black"
    elif aqi_value == 3:
        return "orange"
    elif aqi_value == 4:
        return "red"
    elif aqi_value == 5:
        return "purple"
    elif aqi_value == 6:
        return "darkred"