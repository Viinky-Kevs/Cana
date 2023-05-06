import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  @ViewChild('pTempChart') pTempChart: ElementRef | undefined;

  coordinatesPolygon: any;
  data_temp_a: any;
  data_temp_p: any;

  data: any;
  chartTempA: any;
  chartTempP: any;

  dateTempAvalues: any;
  tempTempAvalues: any;
  foreTempAvalues: any;

  dateTempPvalues: any;
  tempTempPvalues: any;
  foreTempPvalues: any;

  loading = true;
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.coordinatesPolygon = window.history.state.coordinatesPolygon;

    this.http.post<any>('http://127.0.0.1:5000/get_coords', JSON.stringify(this.coordinatesPolygon)).subscribe((response) => { 
        this.loading = false; 
        try{
          const dta = JSON.parse(response.dta);
          this.data_temp_a = dta.data;
        } catch(error){
          console.log('Not info dta');
        };
        try {
          const dtp = JSON.parse(response.dtp);
          this.data_temp_p = dtp.data;
          console.log(this.data_temp_p);
        } catch (error) {
          console.log('Not info dta');
        };
        
        //this.data = JSON.parse(response.toString()).data;
        
        try {
        this.dateTempAvalues = this.data_temp_a.map((d: { [x: string]: any;}) => d['date']);
        this.tempTempAvalues = this.data_temp_a.map((d: { [x: string]: any;}) => d['temp']);
        this.foreTempAvalues = this.data_temp_a.map((d: { [x: string]: any; }) => d['forecast']);
        } catch(error){

        }

        try {
          this.dateTempPvalues = this.data_temp_p.map((d: { [x: string]: any; }) => d['date']);
          this.tempTempPvalues = this.data_temp_p.map((d: { [x: string]: any; }) => d['temp']);
          this.foreTempPvalues = this.data_temp_p.map((d: { [x: string]: any; }) => d['forecast']);
        } catch (error) {

        }

        this.chartTempA = new Chart('azucarTempChart', {
          type: 'line',
          data: {
            labels: this.dateTempAvalues,
            datasets: [
              {
                label: 'Temperatura registrada',
                data: this.tempTempAvalues,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
              },
              {
                label: 'Temperatura Pronóstico',
                data: this.foreTempAvalues,
                backgroundColor: 'rgba(39, 170, 178, 0.2)',
                borderColor: 'rgba(39, 170, 178, 1)',
                borderWidth: 3
              },
            ]
          }
        });

      this.chartTempP = new Chart(this.pTempChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.dateTempPvalues,
          datasets: [
            {
              label: 'Temperatura registrada',
              data: this.tempTempPvalues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2
            },
            {
              label: 'Temperatura Pronóstico',
              data: this.foreTempPvalues,
              backgroundColor: 'rgba(39, 170, 178, 0.2)',
              borderColor: 'rgba(39, 170, 178, 1)',
              borderWidth: 3
            },
          ]
        }
      });

    });
  }  
}
