import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MapComponent } from './map/map.component';
import { BodyComponent } from './body/body.component';
import { GeeComponent } from './gee/gee.component';
import { UploadComponent } from './upload/upload.component';
import { UserComponent } from './user/user.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { NgChartsModule } from 'ng2-charts';
import { Ng2ImgMaxModule } from 'ng2-img-max';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MapComponent,
    BodyComponent,
    GeeComponent,
    UploadComponent,
    UserComponent,
    AnalysisComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule,
    LeafletDrawModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgChartsModule,
    Ng2ImgMaxModule,
    MatIconModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
