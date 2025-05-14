import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { PlacesListComponent } from './places-list/places-list.component';
import { PlaceFormComponent } from './place-form/place-form.component';

const routes: Routes = [
  {
    path: '',
    component: PlacesListComponent
  },
  {
    path: 'new',
    component: PlaceFormComponent
  },
  {
    path: ':id/edit',
    component: PlaceFormComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PlacesListComponent,
    PlaceFormComponent
  ]
})
export class PlacesModule { } 