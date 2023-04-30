import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import "leaflet-draw";
import * as L from 'leaflet';

@Component({
  selector: 'app-gee',
  templateUrl: './gee.component.html',
  styleUrls: ['./gee.component.css']
})
export class GeeComponent implements OnInit {
  geedata: any;
  LeafletMap: any;
  drawnItems: any;
  drawControl: L.Control.Draw | undefined;
  maker: L.Marker<any> | undefined;
  listData: Array<string> | undefined;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    this.http.get('http://127.0.0.1:5000/geedata').subscribe((response) => {
      this.geedata = JSON.parse(response.toString()).data
      console.log(this.geedata)
    });


    var layer_1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var layer_2 = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    this.LeafletMap = L.map("map", { layers: [layer_1] }).setView(L.latLng(4.685347, -74.191439), 6);

    var baseMaps = {
      "Cartográfica": layer_1
    };
    var overLay = {
      "Elevación": layer_2
    }

    L.control.layers(
      baseMaps,
      overLay).addTo(this.LeafletMap);
  }
}
