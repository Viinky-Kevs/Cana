import warnings
import itertools
import numpy as np
import pandas as pd
import geopandas as gpd
import statsmodels.api as sm
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
        estaciones = estaciones[estaciones['cluster'] == cluster_azucar[0]]
        data = pd.read_csv('./data_estaciones/data_temp_col.csv')
        data = data.rename(columns={'obs_values': 'temp', 'Date':'date', 'X':'lon', 'Y':'lat'})
        df = data[data['temp'] >= 0]
        df['date'] = pd.to_datetime(df['date'], 
                                    format = '%Y-%m', 
                                    exact=False, 
                                    infer_datetime_format=False, 
                                    errors='ignore')
        df['lat'], df['lon'] = df['lat'].astype(float), df['lon'].astype(float)
        df = df[df['ID'].isin(estaciones['CODIGO'].unique().tolist())]
        df = df.reset_index(drop=True)
        df = df.groupby(['date'])['temp'].mean().reset_index().round(2)
        tdi = pd.DatetimeIndex(df['date'])
        df.set_index(tdi, inplace=True)
        data_temp = df[['temp']]

        p = range(0,3)
        d = range(1,2)
        q = range(0,3)
        pdq = list(itertools.product(p, d, q))
        seasonal_pdq = [(x[0], x[1], x[2], 12) for x in list(itertools.product(p, d, q))]

        parametros = []
        AIC = []

        for param in pdq:
            for param_seasonal in seasonal_pdq:
                try:
                    mod = sm.tsa.statespace.SARIMAX(data_temp,
                                                    order=param,
                                                    seasonal_order=param_seasonal,
                                                    enforce_stationarity=False,
                                                    enforce_invertibility=False)
                    results = mod.fit(disp=False)
                    parametros.append((param, param_seasonal))
                    AIC.append(results.aic)
                except:
                    continue
            
        model = sm.tsa.statespace.SARIMAX(data_temp['temp'], 
                                        order=parametros[AIC.index(min(AIC))][0],
                                        seasonal_order=parametros[AIC.index(min(AIC))][1])
        results = model.fit(disp=False)

        pred_date = [data_temp.index[-1] + DateOffset(months=x)for x in range(0,48)]
        pred_date = pd.DataFrame(index = pred_date[1:],columns=data_temp.columns)
        data_temp_final = pd.concat([data_temp,pred_date])
        data_op = results.predict(start = (len(data_temp) - 12),end=(len(data_temp) + 48),dynamic=True)
        data_forecast = pd.Series(data_op.tolist(), 
                                  index = data_temp_final.index[(len(data_temp_final) - len(data_op)):], 
                                  name='forecast')
        data_temp_final = data_temp_final.join(data_forecast)
        print(data_temp_final)
    
    if len(cluster_panela) != 0:
        print(f'Panela {cluster_panela[0]}')
        estaciones = estaciones[estaciones['cluster'] == cluster_panela[0]]
        data = pd.read_csv('./data_estaciones/data_temp_col.csv')
        data = data.rename(columns={'obs_values': 'temp', 'Date':'date', 'X':'lon', 'Y':'lat'})
        df = data[data['temp'] >= 0]
        df['date'] = pd.to_datetime(df['date'], 
                                    format = '%Y-%m', 
                                    exact=False, 
                                    infer_datetime_format=False, 
                                    errors='ignore')
        df['lat'], df['lon'] = df['lat'].astype(float), df['lon'].astype(float)
        df = df[df['ID'].isin(estaciones['CODIGO'].unique().tolist())]
        df = df.reset_index(drop=True)
        df = df.groupby(['date'])['temp'].mean().reset_index().round(2)
        tdi = pd.DatetimeIndex(df['date'])
        df.set_index(tdi, inplace=True)
        data_temp = df[['temp']]

        p = range(0,3)
        d = range(1,2)
        q = range(0,3)
        pdq = list(itertools.product(p, d, q))
        seasonal_pdq = [(x[0], x[1], x[2], 12) for x in list(itertools.product(p, d, q))]

        parametros = []
        AIC = []

        for param in pdq:
            for param_seasonal in seasonal_pdq:
                try:
                    mod = sm.tsa.statespace.SARIMAX(data_temp,
                                                    order=param,
                                                    seasonal_order=param_seasonal,
                                                    enforce_stationarity=False,
                                                    enforce_invertibility=False)
                    results = mod.fit(disp=False)
                    parametros.append((param, param_seasonal))
                    AIC.append(results.aic)
                except:
                    continue
            
        model = sm.tsa.statespace.SARIMAX(data_temp['temp'], 
                                        order=parametros[AIC.index(min(AIC))][0],
                                        seasonal_order=parametros[AIC.index(min(AIC))][1])
        results = model.fit(disp=False)

        pred_date = [data_temp.index[-1] + DateOffset(months=x)for x in range(0,48)]
        pred_date = pd.DataFrame(index = pred_date[1:],columns=data_temp.columns)
        data_temp_final = pd.concat([data_temp,pred_date])
        data_op = results.predict(start = (len(data_temp) - 12),
                                  end = (len(data_temp) + 48),dynamic=True)
        data_forecast = pd.Series(data_op.tolist(), 
                                  index=data_temp_final.index[(len(data_temp_final) - len(data_op)):], 
                                  name='forecast')
        data_temp_final = data_temp_final.join(data_forecast)
        print(data_temp_final)
    

    return jsonify({'message': 'Data recived'})

if '__main__' == __name__:
    app.run(
        host = '127.0.0.1',
        port = 5000,
        debug = True
    )