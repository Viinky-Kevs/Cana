import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { GeolocationService } from '@ng-web-apis/geolocation';
import "leaflet-draw";
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  numbers: number[];
  LeafletMap: any;
  drawnItems: any;
  drawControl: L.Control.Draw | undefined;
  maker: L.Marker<any> | undefined;


  constructor(private readonly geolocation$: GeolocationService) {
    this.numbers = [4.685347, -74.191439];
    geolocation$.pipe(take(1)).subscribe(position => {
      this.numbers[0] = position.coords.latitude;
      this.numbers[1] = position.coords.longitude;
      this.LeafletMap?.setView(L.latLng(this.numbers[0], this.numbers[1]), 18);
    });
  }

  ngOnInit(): void {

    var layer_1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var layer_2 = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    this.LeafletMap = L.map("map", { layers: [layer_1] }).setView(L.latLng(this.numbers[0], this.numbers[1]), 10);

    var baseMaps = {
      "Cartográfica": layer_1
    };
    var overLay = {
      "Elevación": layer_2
    }

    L.control.layers(
      baseMaps,
      overLay).addTo(this.LeafletMap);

    this.LeafletMap.pm.addControls({
      position: 'topright',
      drawCircle: true,
      drawCircleMarker: true,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
      drawMarker: true
    });

    this.LeafletMap.on('pm:create', (e: any) => {
      var shape = e.layer;
      alert('Ahora ve a guardar el lote y seguir con las instrucciones!')
      console.log(shape._latlngs)
    });

    this.LeafletMap.pm.setLang('es');
  };
}
