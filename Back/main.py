import warnings
import numpy as np
import pandas as pd
import datetime as dt
import requests as rq
import geopandas as gpd
import statsmodels.api as sm
from datetime import datetime
from flask_cors import CORS
from json import loads, dumps
from shapely.geometry import mapping
from flask import Flask, jsonify, request
from shapely.geometry import Point, Polygon
from pandas.tseries.offsets import DateOffset

warnings.filterwarnings('ignore')

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['JSONIFY_MIMETYPE'] = '/get_coords'
CORS(app)

@app.route('/geedata', methods=['GET'])
def get():
    data = pd.read_csv('./data_gee/gee_catalog.csv')
    delete = []
    for i in range(len(data)):
        d = data['title'].iloc[i]
        f = d.find('deprecated')
        if f != -1:
            delete.append(i)
                    
    data = data.drop(delete, axis=0).reset_index(drop=True)
    data_clean = data[['id', 'title']]
    data_json = data_clean.to_json(orient='table')
    parsed = loads(data_json)
    data_to_send = dumps(parsed, indent=2)
            
    return jsonify(data_to_send)

@app.route('/get_coords', methods=['POST', 'GET'])
def post():
    coord = request.data
    data = coord.decode('UTF-8')
    data = data.strip('][').split(', ')
    data = loads('[' + str(data[0]) + ']')

    def Centroid(array):
        array = np.array(array)
        length = array.shape[0]
        sum_x = np.sum(array[:, 0])
        sum_y = np.sum(array[:, 1])
        return sum_x/length, sum_y/length
    
    coords_cent = []
    for i in data:
        coords_cent.append((i['lat'], i['lng']))
    centroide = Centroid(coords_cent)

    cana_p = gpd.read_file('./data_shapefiles/Clusters_panela_thiessen v2.shp')
    cana_p = cana_p.sort_values(by=['clusters']).reset_index(drop=True)
    cana_a = gpd.read_file('./data_shapefiles/Clusters_cana_thiessen v2.shp')
    cana_a = cana_a.sort_values(by=['clusters']).reset_index(drop=True)

    lat, lon = centroide[0], centroide[1]
    cluster_panela = []
    for j in range(len(cana_p)):
        poly_mapped = mapping(cana_p['geometry'].iloc[j])['coordinates']
        for k in range(len(poly_mapped)):
            for l in range(len(poly_mapped[k])):
                poligon = [x for x in poly_mapped[k][l]]
                point = Point(lon, lat)
                polygon = Polygon(poligon)
                if polygon.contains(point):
                    cluster_panela.append(cana_p['clusters'].iloc[j])
    
    cluster_azucar = []
    for j in range(len(cana_a)):
        poly_mapped = mapping(cana_a['geometry'].iloc[j])['coordinates']
        for k in range(len(poly_mapped)):
            for l in range(len(poly_mapped[k])):
                poligon = [x for x in poly_mapped[k][l]]
                point = Point(lon, lat)
                polygon = Polygon(poligon)
                if polygon.contains(point):
                    cluster_azucar.append(cana_a['clusters'].iloc[j])
    
    estaciones = pd.read_csv('./data_estaciones/data_estaciones.csv')
    
    if len(cluster_azucar) != 0:
        print(f'Azucar {cluster_azucar[0]}')
    
    if len(cluster_panela) != 0:
        print(f'Panela {cluster_panela[0]}')

    locations = [(lat, lon)]
    dates = [19810101, str(datetime.now().strftime('%Y-%m-%d')).replace('-','')]
    base_url = r"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=RH2M,T2MDEW&community=RE&longitude={longitude}&latitude={latitude}&start={startdate}&end={enddate}&format=JSON"

    d = []
    for latitude, longitude in locations:
        api_request_url = base_url.format(longitude=longitude, latitude=latitude, startdate = dates[0], enddate = dates[1])
        response = rq.get(url=api_request_url, verify=True, timeout=30.00)
        d.append(response.json())

    data_pw_ini = pd.DataFrame(d[0]['properties']['parameter'])
    data_pw_ini['fecha'] = data_pw_ini.index
    data_pw_ini = data_pw_ini.reset_index(drop=True)
    data_pw_ini = data_pw_ini[data_pw_ini['RH2M'] >= 0]
    print(data_pw_ini)

    return jsonify({'message': 'Data recived'})

if '__main__' == __name__:
    app.run(
        host = '127.0.0.1',
        port = 5000,
        debug = True
    )