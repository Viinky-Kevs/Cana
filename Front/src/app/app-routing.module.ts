import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { GeeComponent } from './gee/gee.component';
import { UploadComponent } from './upload/upload.component';
import { UserComponent } from './user/user.component';
import { AnalysisComponent } from './analysis/analysis.component';


const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  { path: 'map', component: MapComponent },
  { path: 'gee', component: GeeComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'user', component: UserComponent },
  { path: 'analysis', component:AnalysisComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
