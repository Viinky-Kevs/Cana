import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  @ViewChild('pTempChart') pTempChart: ElementRef | undefined;
  @ViewChild('pPrepChart') pPrepChart: ElementRef | undefined;
  @ViewChild('pHRChart') pHRChart: ElementRef | undefined;
  @ViewChild('pPRChart') pPRChart: ElementRef | undefined;

  @ViewChild('aTempChart') aTempChart: ElementRef | undefined;
  @ViewChild('aPrepChart') aPrepChart: ElementRef | undefined;
  @ViewChild('aHRChart') aHRChart: ElementRef | undefined;
  @ViewChild('aPRChart') aPRChart: ElementRef | undefined;

  coordinatesPolygon: any;
  data_temp_a: any;
  data_temp_p: any;
  data_prep_a: any;
  data_prep_p: any;
  data_HR_a: any;
  data_HR_p: any;
  data_PR_a: any;
  data_PR_p: any;

  data: any;
  chartTempA: any;
  chartTempP: any;
  chartPrepA: any;
  chartPrepP: any;
  chartHRA: any;
  chartHRP: any;
  chartPRA: any;
  chartPRP: any;

  dateTempAvalues: any;
  tempTempAvalues: any;
  foreTempAvalues: any;
  datePrepAvalues: any;
  prepPrepAvalues: any;
  forePrepAvalues: any;
  dateHRAvalues: any;
  hrHRAvalues: any;
  foreHRAvalues: any;
  datePRAvalues: any;
  prPRAvalues: any;
  forePRAvalues: any;

  dateTempPvalues: any;
  tempTempPvalues: any;
  foreTempPvalues: any;
  datePrepPvalues: any;
  prepPrepPvalues: any;
  forePrepPvalues: any;
  dateHRPvalues: any;
  hrHRPvalues: any;
  foreHRPvalues: any;
  datePRPvalues: any;
  prPRPvalues: any;
  forePRPvalues: any;

  area:any;

  loading = true;
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.coordinatesPolygon = window.history.state.coordinatesPolygon;

    this.http.post<any>('http://127.0.0.1:5000/get_coords', JSON.stringify(this.coordinatesPolygon)).subscribe((response) => { 
        this.loading = false; 
        try{
          const dta = JSON.parse(response.dta);
          const dpa = JSON.parse(response.dpa);
          const dHRa = JSON.parse(response.dhra);
          const dPRa = JSON.parse(response.dpra);
          this.area = JSON.parse(response.area);
          this.data_temp_a = dta.data;
          this.data_prep_a = dpa.data;
          this.data_HR_a = dHRa.data;
          this.data_PR_a = dPRa.data;
        } catch(error){
          console.log('Not info dta');
          alert('No hay información para caña azucarera');
          this.loading = false;
        };
        try {
          const dtp = JSON.parse(response.dtp);
          const dpp = JSON.parse(response.dpp);
          const dHRp = JSON.parse(response.dhra);
          const dPRp = JSON.parse(response.dpra);
          this.data_temp_p = dtp.data;
          this.data_prep_p = dpp.data;
          this.data_HR_p = dHRp.data;
          this.data_PR_p = dPRp.data;
          
        } catch (error) {
          console.log('Not info dtp');
          alert('No hay información para caña panelera');
          this.loading = false;
        };
        
        try {
          this.dateTempAvalues = this.data_temp_a.map((d: { [x: string]: any;}) => d['date']);
          this.tempTempAvalues = this.data_temp_a.map((d: { [x: string]: any;}) => d['temp']);
          this.foreTempAvalues = this.data_temp_a.map((d: { [x: string]: any; }) => d['forecast']);

          this.datePrepAvalues = this.data_prep_a.map((d: { [x: string]: any; }) => d['date']);
          this.prepPrepAvalues = this.data_prep_a.map((d: { [x: string]: any; }) => d['prep']);
          this.forePrepAvalues = this.data_prep_a.map((d: { [x: string]: any; }) => d['forecast']);

          this.dateHRAvalues = this.data_HR_a.map((d: { [x: string]: any; }) => d['date']);
          this.hrHRAvalues = this.data_HR_a.map((d: { [x: string]: any; }) => d['HR']);
          this.foreHRAvalues = this.data_HR_a.map((d: { [x: string]: any; }) => d['forecast']);

          this.datePRAvalues = this.data_PR_a.map((d: { [x: string]: any; }) => d['date']);
          this.prPRAvalues = this.data_PR_a.map((d: { [x: string]: any; }) => d['PR']);
          this.forePRAvalues = this.data_PR_a.map((d: { [x: string]: any; }) => d['forecast']);

        } catch(error){

        }

        try {
          this.dateTempPvalues = this.data_temp_p.map((d: { [x: string]: any; }) => d['date']);
          this.tempTempPvalues = this.data_temp_p.map((d: { [x: string]: any; }) => d['temp']);
          this.foreTempPvalues = this.data_temp_p.map((d: { [x: string]: any; }) => d['forecast']);

          this.datePrepPvalues = this.data_prep_p.map((d: { [x: string]: any; }) => d['date']);
          this.prepPrepPvalues = this.data_prep_p.map((d: { [x: string]: any; }) => d['prep']);
          this.forePrepPvalues = this.data_prep_p.map((d: { [x: string]: any; }) => d['forecast']);

          this.dateHRPvalues = this.data_HR_p.map((d: { [x: string]: any; }) => d['date']);
          this.hrHRPvalues = this.data_HR_p.map((d: { [x: string]: any; }) => d['HR']);
          this.foreHRPvalues = this.data_HR_p.map((d: { [x: string]: any; }) => d['forecast']);

          this.datePRPvalues = this.data_PR_p.map((d: { [x: string]: any; }) => d['date']);
          this.prPRPvalues = this.data_PR_p.map((d: { [x: string]: any; }) => d['PR']);
          this.forePRPvalues = this.data_PR_p.map((d: { [x: string]: any; }) => d['forecast']);
        } catch (error) {

        }

      /*  Código de gráficos para Caña de azucar */

      this.chartTempA = new Chart(this.aTempChart?.nativeElement, {
          type: 'line',
          data: {
            labels: this.dateTempAvalues,
            datasets: [
              {
                label: 'Temperatura Registrada',
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
          },
        options: {
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: 'Temperatura (°C)'
              }
            },
            x:
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
        });

      this.chartPrepA = new Chart(this.aPrepChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.datePrepAvalues,
          datasets: [
            {
              label: 'Precipitación Registrada',
              data: this.prepPrepAvalues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2
            },
            {
              label: 'Precipitación Pronóstico',
              data: this.forePrepAvalues,
              backgroundColor: 'rgba(39, 170, 178, 0.2)',
              borderColor: 'rgba(39, 170, 178, 1)',
              borderWidth: 3
            },
          ]
        },
        options: {
          scales: {
            y :{
              display: true,
              title :{
                display: true,
                text: 'Precipitación (mm)'
              }
            },
            x: 
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
      });

      this.chartHRA = new Chart(this.aHRChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.dateHRAvalues,
          datasets: [
            {
              label: 'Humedad Relativa Registrada',
              data: this.hrHRAvalues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2
            },
            {
              label: 'Humedad Relativa Pronóstico',
              data: this.foreHRAvalues,
              backgroundColor: 'rgba(39, 170, 178, 0.2)',
              borderColor: 'rgba(39, 170, 178, 1)',
              borderWidth: 3
            },
          ]
        },
        options: {
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: 'Humedad Relativa (%)'
              }
            },
            x:
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
      });

      this.chartPRA = new Chart(this.aPRChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.dateHRAvalues,
          datasets: [
            {
              label: 'Punto de Rocío Registrada',
              data: this.prPRAvalues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2
            },
            {
              label: 'Punto de Rocío Pronóstico',
              data: this.forePRAvalues,
              backgroundColor: 'rgba(39, 170, 178, 0.2)',
              borderColor: 'rgba(39, 170, 178, 1)',
              borderWidth: 3
            },
          ]
        },
        options: {
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: 'Temperatura (°C)'
              }
            },
            x:
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
      });

      /*  Código de gráficos para Caña de panela */

      this.chartTempP = new Chart(this.pTempChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.dateTempPvalues,
          datasets: [
            {
              label: 'Temperatura Registrada',
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
        },
        options: {
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: 'Temperatura (°C)'
              }
            },
            x:
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
      });

      this.chartPrepP = new Chart(this.pPrepChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.datePrepPvalues,
          datasets: [
            {
              label: 'Precipitación Registrada',
              data: this.prepPrepPvalues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2
            },
            {
              label: 'Precipitación Pronóstico',
              data: this.forePrepPvalues,
              backgroundColor: 'rgba(39, 170, 178, 0.2)',
              borderColor: 'rgba(39, 170, 178, 1)',
              borderWidth: 3
            },
          ]
        },
        options: {
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: 'Precipitación (mm)'
              }
            },
            x:
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
      });

      this.chartHRP = new Chart(this.pHRChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.dateHRPvalues,
          datasets: [
            {
              label: 'Humedad Relativa Registrada',
              data: this.hrHRPvalues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2
            },
            {
              label: 'Humedad Relativa Pronóstico',
              data: this.foreHRPvalues,
              backgroundColor: 'rgba(39, 170, 178, 0.2)',
              borderColor: 'rgba(39, 170, 178, 1)',
              borderWidth: 3
            },
          ]
        },
        options: {
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: 'Humedad Relativa (%)'
              }
            },
            x:
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
      });

      this.chartPRP = new Chart(this.pPRChart?.nativeElement, {
        type: 'line',
        data: {
          labels: this.dateHRPvalues,
          datasets: [
            {
              label: 'Punto de Rocío Registrada',
              data: this.prPRPvalues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2
            },
            {
              label: 'Punto de Rocío Pronóstico',
              data: this.forePRPvalues,
              backgroundColor: 'rgba(39, 170, 178, 0.2)',
              borderColor: 'rgba(39, 170, 178, 1)',
              borderWidth: 3
            },
          ]
        },
        options: {
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: 'Temperatura (°C)'
              }
            },
            x:
            {
              display: true,
              title: {
                display: true,
                text: 'Fecha (AAAA-MM)'
              }
            },
          }
        }
      });
    });
  }  
}
