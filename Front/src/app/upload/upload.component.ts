import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
//import PSPDFKit from "pspdfkit";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements AfterViewInit{

  @ViewChild('canvas') canvasRef: ElementRef | undefined;
  private canvas: HTMLCanvasElement | undefined;

  constructor() { }

  ngAfterViewInit(): void {
      this.onFileSelected;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      console.log(file)
      return;
    }
    const reader = new FileReader();
  }

}
