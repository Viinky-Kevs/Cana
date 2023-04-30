import numpy as np
import pandas as pd
from flask_cors import CORS
from json import loads, dumps
from flask import Flask, jsonify
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)
CORS(app)

class Gee(Resource):
    def get(self):
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
    
api.add_resource(Gee, '/geedata')

if '__main__' == __name__:
    app.run(
        host = '127.0.0.1',
        port = 5000,
        debug = True
    )