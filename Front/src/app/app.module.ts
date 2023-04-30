import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MapComponent } from './map/map.component';
import { BodyComponent } from './body/body.component';
import { GeeComponent } from './gee/gee.component';
import { UploadComponent } from './upload/upload.component';
import { UserComponent } from './user/user.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MapComponent,
    BodyComponent,
    GeeComponent,
    UploadComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule,
    LeafletDrawModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
