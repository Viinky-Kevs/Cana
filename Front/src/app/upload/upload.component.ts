import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {

  selectedFile: File | null = null;
  imageUrl: any;
  loading = false;

  constructor(private http: HttpClient) { }

  handleFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      this.selectedFile = inputElement.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('Por favor selecciona un archivo raster (Ej. .tif)');
      return;
    }
    this.loading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:5000/get_tif', formData).subscribe(
      (response: any) => {
        alert('Archivo subido satisfactoriamente!');
        this.imageUrl = 'data:image/tiff;base64,'+ response.image;
        this.loading = false;
      },
      (error) => {
        console.error('Error uploading file:', error);
        alert('Error uploading file. See console for details.');
      }
    );
  }
  
}
