import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit{

  constructor(private http: HttpClient) {}

  coordinatesPolygon : any;
  loading = true;

  ngOnInit(): void {
      this.coordinatesPolygon = window.history.state.coordinatesPolygon;
      console.log(this.coordinatesPolygon)
      this.http.post('http://127.0.0.1:5000/get_coords', JSON.stringify(this.coordinatesPolygon)).subscribe(response => { 
        console.log(response);
        this.loading = false;
      });
  }

}
