import io
import os
import base64
import warnings
import rasterio
import numpy as np
import pandas as pd
import requests as rq
import geopandas as gpd
import statsmodels.api as sm
import matplotlib.pyplot as plt
from pyproj import Geod
from flask_cors import CORS
from datetime import datetime
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

@app.route('/')
def init():
    return '<h1>Function</h1>'

@app.route('/geedata', methods=['GET'])
def get():
    print(os.path.dirname(os.path.abspath(__file__)))
    data = pd.read_csv(f'{os.path.dirname(os.path.abspath(__file__))}/data_gee/gee_catalog.csv')
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

@app.route('/get_coords', methods=['POST'])
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

    geod = Geod(ellps="WGS84")
    poly = Polygon(coords_cent)
    area_lote = abs(geod.geometry_area_perimeter(poly)[0])
    
    cana_p = gpd.read_file(f'{os.path.dirname(os.path.abspath(__file__))}/data_shapefiles/Clusters_panela_thiessen v2.shp')
    cana_p = cana_p.sort_values(by=['clusters']).reset_index(drop=True)
    cana_a = gpd.read_file(f'{os.path.dirname(os.path.abspath(__file__))}/data_shapefiles/Clusters_cana_thiessen v2.shp')
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
    
    if len(cluster_azucar) != 0:
        print(f'Azucar {cluster_azucar[0]}')
        data_temp_a = pd.read_csv(f'{os.path.dirname(os.path.abspath(__file__))}/data_estaciones/data_temp_cluster_{cluster_azucar[0]}.csv')
        data_prep_a = pd.read_csv(f'{os.path.dirname(os.path.abspath(__file__))}/data_estaciones/data_prep_cluster_{cluster_azucar[0]}.csv')
    
    if len(cluster_panela) != 0:
        print(f'Panela {cluster_panela[0]}')
        data_temp_p = pd.read_csv(f'{os.path.dirname(os.path.abspath(__file__))}/data_estaciones/data_temp_cluster_{cluster_panela[0]}.csv')
        data_prep_p = pd.read_csv(f'{os.path.dirname(os.path.abspath(__file__))}/data_estaciones/data_prep_cluster_{cluster_panela[0]}.csv')

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
    data_pw = data_pw_ini.copy()
    #print(pd.to_datetime(data_pw['fecha'].astype(int), format='%Y%m%d'))
    data_pw['fecha'] = pd.to_datetime(data_pw['fecha'].astype(int), format='%Y%m%d')
    data_pw['fecha'] = data_pw['fecha'].dt.strftime('%Y-%m')
    data_g = data_pw.groupby(['fecha']).mean().reset_index().round(2)
    data_g = data_g.rename(columns={'RH2M':'HR', 'T2MDEW':'PR', 'fecha':'date'})

    tdi = pd.DatetimeIndex(data_g['date'])
    data_g.set_index(tdi, inplace=True)
    data_hr = data_g[['HR']]
    data_pr = data_g[['PR']]                
    
    model = sm.tsa.statespace.SARIMAX(data_hr['HR'], 
                                    order=(1,1,2),
                                    seasonal_order=(1,1,2,12))
    results = model.fit(disp=False)

    pred_date = [data_hr.index[-1]+ DateOffset(months=x)for x in range(0,20)]
    pred_date = pd.DataFrame(index=pred_date[1:],columns=data_hr.columns)
    data_hr_final = pd.concat([data_hr,pred_date])
    data_op = results.predict(start=(len(data_hr) - 12),end=(len(data_hr) + 20),dynamic=True)
    data_forecast = pd.Series(data_op.tolist(), index=data_hr_final.index[(len(data_hr_final) - len(data_op)):], name='forecast')
    data_hr_final = data_hr_final.join(data_forecast)
    data_hr_final.index.name= 'date'
                  
    model = sm.tsa.statespace.SARIMAX(data_pr['PR'], 
                                    order=(1,1,2),
                                    seasonal_order=(1,1,2,12))
    results = model.fit(disp=False)

    pred_date = [data_pr.index[-1]+ DateOffset(months=x)for x in range(0,20)]
    pred_date = pd.DataFrame(index=pred_date[1:],columns=data_pr.columns)
    data_pr_final = pd.concat([data_pr,pred_date])
    data_op = results.predict(start=(len(data_pr) - 12),end=(len(data_pr) + 20),dynamic=True)
    data_forecast = pd.Series(data_op.tolist(), index=data_pr_final.index[(len(data_pr_final) - len(data_op)):], name='forecast')
    data_pr_final = data_pr_final.join(data_forecast)
    data_pr_final.index.name= 'date'

    if (len(cluster_azucar) != 0) and (len(cluster_panela) != 0):
        data_json_a = data_temp_a.to_json(orient='table')
        parsed_a = loads(data_json_a)
        data_to_send_a = dumps(parsed_a, indent=2)

        data_json_ap = data_prep_a.to_json(orient='table')
        parsed_ap = loads(data_json_ap)
        data_to_send_ap = dumps(parsed_ap, indent=2)

        data_json_p = data_temp_p.to_json(orient='table')
        parsed_p = loads(data_json_p)
        data_to_send_p = dumps(parsed_p, indent=2)

        data_json_pp = data_prep_p.to_json(orient='table')
        parsed_pp = loads(data_json_pp)
        data_to_send_pp = dumps(parsed_pp, indent=2)

        data_json_ahr = data_hr_final.to_json(orient='table')
        parsed_ahr = loads(data_json_ahr)
        data_to_send_ahr = dumps(parsed_ahr, indent=2)

        data_json_apr = data_pr_final.to_json(orient='table')
        parsed_apr = loads(data_json_apr)
        data_to_send_apr = dumps(parsed_apr, indent=2)

        return jsonify(dta = data_to_send_a,
                       dpa = data_to_send_ap,
                       dtp = data_to_send_p,
                       dpp = data_to_send_pp,
                       dhra = data_to_send_ahr,
                       dpra = data_to_send_apr,
                       area = round(area_lote, 2))
    
    elif (len(cluster_azucar) != 0) and (len(cluster_panela) == 0):
        data_json_at = data_temp_a.to_json(orient='table')
        parsed_at = loads(data_json_at)
        data_to_send_at = dumps(parsed_at, indent=2)

        data_json_ap = data_prep_a.to_json(orient='table')
        parsed_ap = loads(data_json_ap)
        data_to_send_ap = dumps(parsed_ap, indent=2)

        data_json_ahr = data_hr_final.to_json(orient='table')
        parsed_ahr = loads(data_json_ahr)
        data_to_send_ahr = dumps(parsed_ahr, indent=2)

        data_json_apr = data_pr_final.to_json(orient='table')
        parsed_apr = loads(data_json_apr)
        data_to_send_apr = dumps(parsed_apr, indent=2)

        return jsonify(dta = data_to_send_at,
                       dpa = data_to_send_ap,
                       dhra = data_to_send_ahr,
                       dpra = data_to_send_apr,
                       area = round(area_lote, 2))
    
    elif (len(cluster_azucar) == 0) and (len(cluster_panela) != 0):
        data_json_p = data_temp_p.to_json(orient='table')
        parsed_p = loads(data_json_p)
        data_to_send_p = dumps(parsed_p, indent=2)

        data_json_pp = data_prep_p.to_json(orient='table')
        parsed_pp = loads(data_json_pp)
        data_to_send_pp = dumps(parsed_pp, indent=2)

        data_json_ahr = data_hr_final.to_json(orient='table')
        parsed_ahr = loads(data_json_ahr)
        data_to_send_ahr = dumps(parsed_ahr, indent=2)

        data_json_apr = data_pr_final.to_json(orient='table')
        parsed_apr = loads(data_json_apr)
        data_to_send_apr = dumps(parsed_apr, indent=2)

        return jsonify(dtp = data_to_send_p,
                       dpp = data_to_send_pp,
                       dhra = data_to_send_ahr,
                       dpra = data_to_send_apr,
                       area = round(area_lote, 2))
    else:
        return jsonify({'message':'Los datos no están dentro un cluster'})

@app.route('/get_tif', methods=['POST'])
def data():
    file = request.files['file']

    image = rasterio.open(file)
    
    fig, ax = plt.subplots(1, figsize=(12, 20))

    ax.imshow(image.read(1, masked=True), cmap='Greys_r')
    plt.axis('off')
    fig.subplots_adjust(
        top=1.0,
        bottom=0.0,
        left=0.0,
        right=1.0,
        hspace=0.2,
        wspace=0.2
    )

    buffer = io.BytesIO()

    fig.savefig(buffer, format='png')
    
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return jsonify({'image': image_base64})


if '__main__' == __name__:
    app.run(
        host = '0.0.0.0',
        port = '5000',
        debug = False
    )