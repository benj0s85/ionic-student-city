import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { PlaceService } from '../../../core/services/place.service';
import { Place } from '../../../core/models/place.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

type PlaceType = 'Restaurant' | 'Bar' | 'Bibliotheque' | 'Salle_sport';

@Component({
  selector: 'app-place-form',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/places"></ion-back-button>
        </ion-buttons>
        <ion-title>Proposer un établissement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="placeForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Nom de l'établissement</ion-label>
          <ion-input formControlName="name" type="text"></ion-input>
          <ion-note slot="error" *ngIf="placeForm.get('name')?.touched && placeForm.get('name')?.errors?.['required']">
            Le nom est requis
          </ion-note>
          <ion-note slot="error" *ngIf="placeForm.get('name')?.touched && placeForm.get('name')?.errors?.['minlength']">
            Le nom doit contenir au moins 2 caractères
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Type d'établissement</ion-label>
          <ion-select formControlName="type" interface="action-sheet">
            <ion-select-option value="Restaurant">Restaurant</ion-select-option>
            <ion-select-option value="Bar">Bar</ion-select-option>
            <ion-select-option value="Bibliotheque">Bibliothèque</ion-select-option>
            <ion-select-option value="Salle_sport">Salle de sport</ion-select-option>
          </ion-select>
          <ion-note slot="error" *ngIf="placeForm.get('type')?.touched && placeForm.get('type')?.errors?.['required']">
            Le type est requis
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Adresse</ion-label>
          <ion-input formControlName="adresse" type="text"></ion-input>
          <ion-note slot="error" *ngIf="placeForm.get('adresse')?.touched && placeForm.get('adresse')?.errors?.['required']">
            L'adresse est requise
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea formControlName="description" rows="4" auto-grow="true"></ion-textarea>
          <ion-note slot="error" *ngIf="placeForm.get('description')?.touched && placeForm.get('description')?.errors?.['required']">
            La description est requise
          </ion-note>
          <ion-note slot="error" *ngIf="placeForm.get('description')?.touched && placeForm.get('description')?.errors?.['minlength']">
            La description doit contenir au moins 10 caractères
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Latitude</ion-label>
          <ion-input formControlName="latitude" type="number" step="0.000001"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Longitude</ion-label>
          <ion-input formControlName="longitude" type="number" step="0.000001"></ion-input>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="!placeForm.valid || isSubmitting" class="ion-margin-top">
          {{ isSubmitting ? 'Envoi en cours...' : 'Proposer l\'établissement' }}
        </ion-button>
      </form>
    </ion-content>
  `
})
export class PlaceFormComponent implements OnInit {
  placeForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private placeService: PlaceService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.placeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      latitude: [null],
      longitude: [null]
    });
  }

  ngOnInit() {}

  private formatFormValue(formValue: any): Partial<Place> {
    const formatted: Partial<Place> = {
      name: (formValue.name || '').trim(),
      type: formValue.type as PlaceType,
      adresse: (formValue.adresse || '').trim(),
      description: (formValue.description || '').trim()
    };

    // Ne pas inclure les coordonnées si elles sont vides ou invalides
    if (formValue.latitude !== null && formValue.latitude !== '' && !isNaN(Number(formValue.latitude))) {
      formatted.latitude = Number(formValue.latitude);
    }
    if (formValue.longitude !== null && formValue.longitude !== '' && !isNaN(Number(formValue.longitude))) {
      formatted.longitude = Number(formValue.longitude);
    }

    console.log('Données du formulaire formatées:', {
      original: formValue,
      formatted: formatted
    });

    return formatted;
  }

  async onSubmit() {
    if (this.placeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        const formValue = this.placeForm.value;
        const placeData = this.formatFormValue(formValue);

        await this.placeService.createPlace(placeData).toPromise();
        
        const toast = await this.toastCtrl.create({
          message: 'Établissement proposé avec succès',
          duration: 3000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
        
        this.router.navigate(['/places']);
      } catch (error: any) {
        console.error('Erreur lors de la création:', error);
        const toast = await this.toastCtrl.create({
          message: error.message || 'Erreur lors de la création de l\'établissement',
          duration: 5000,
          color: 'danger',
          position: 'bottom',
          buttons: [
            {
              text: 'OK',
              role: 'cancel'
            }
          ]
        });
        await toast.present();
      } finally {
        this.isSubmitting = false;
      }
    } else if (!this.placeForm.valid) {
      // Afficher les erreurs de validation
      Object.keys(this.placeForm.controls).forEach(key => {
        const control = this.placeForm.get(key);
        if (control?.errors) {
          console.log(`Erreurs pour le champ ${key}:`, control.errors);
        }
      });
      this.placeForm.markAllAsTouched();
    }
  }
} 