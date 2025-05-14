import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PlaceService } from '../../../core/services/place.service';
import { Place } from '../../../core/models/place.model';

@Component({
  selector: 'app-place-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Établissements</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/places/new">
            <ion-icon name="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item *ngFor="let place of places">
          <ion-label>
            <h2>{{ place.name }}</h2>
            <p>{{ place.type | titlecase }}</p>
            <p>{{ place.adresse }}</p>
          </ion-label>
        </ion-item>

        <ion-item *ngIf="places.length === 0">
          <ion-label>
            <p>Aucun établissement disponible</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/places/new">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class PlaceListComponent implements OnInit {
  places: Place[] = [];

  constructor(private placeService: PlaceService) {}

  ngOnInit() {
    this.loadPlaces();
  }

  private loadPlaces() {
    this.placeService.getPlaces().subscribe({
      next: (places) => {
        this.places = places;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des établissements:', error);
      }
    });
  }
} 