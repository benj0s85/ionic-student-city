import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Place } from '../../../core/models/place.model';
import { PlaceService } from '../../../core/services/place.service';

@Component({
  selector: 'app-place-form',
  templateUrl: './place-form.component.html',
  styleUrls: ['./place-form.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class PlaceFormComponent implements OnInit {
  placeForm: FormGroup;
  isEdit = false;
  placeId?: number;

  placeTypes: string[] = [
    'restaurant',
    'bar',
    'cafe',
    'musee',
    'parc',
    'monument',
    'hotel',
    'commerce',
    'sport',
    'autre'
  ];

  constructor(
    private fb: FormBuilder,
    private placeService: PlaceService,
    public router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {
    this.placeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      adresse: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      latitude: [null],
      longitude: [null]
    });
  }

  ngOnInit() {
    this.placeId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.placeId) {
      this.isEdit = true;
      this.loadPlace(this.placeId);
    }
  }

  loadPlace(id: number) {
    this.placeService.getPlace(id).subscribe({
      next: (place) => {
        this.placeForm.patchValue(place);
      },
      error: async () => {
        const toast = await this.toastController.create({
          message: 'Erreur lors du chargement du lieu',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
        this.router.navigate(['/places']);
      }
    });
  }

  async onSubmit() {
    console.log('Début de soumission du formulaire');
    console.log('État du formulaire:', {
      valid: this.placeForm.valid,
      value: this.placeForm.value,
      errors: this.placeForm.errors,
      touched: this.placeForm.touched,
      dirty: this.placeForm.dirty
    });

    if (this.placeForm.valid) {
      const placeData: Place = this.placeForm.value;
      console.log('Données du lieu à envoyer:', placeData);
      
      const action = this.isEdit ? 
        this.placeService.updatePlace(this.placeId!, placeData) :
        this.placeService.createPlace(placeData);

      action.subscribe({
        next: async (response) => {
          console.log('Réponse du serveur après création/modification:', response);
          const toast = await this.toastController.create({
            message: `Lieu ${this.isEdit ? 'modifié' : 'créé'} avec succès`,
            duration: 3000,
            color: 'success'
          });
          toast.present();
          this.navigateToList();
        },
        error: async (error) => {
          console.error('Erreur lors de la création/modification:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message,
            details: error.error?.detail || error.error?.message || 'Pas de détails supplémentaires'
          });

          let errorMessage = 'Une erreur est survenue';

          // Gestion des différents formats d'erreur possibles
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.detail) {
              errorMessage = error.error.detail;
            } else if (error.error.violations) {
              errorMessage = error.error.violations
                .map((v: { propertyPath: string; message: string }) => `${v.propertyPath}: ${v.message}`)
                .join('\n');
            } else if (typeof error.error === 'object') {
              errorMessage = Object.entries(error.error)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            }
          }

          const toast = await this.toastController.create({
            message: `Erreur lors de ${this.isEdit ? 'la modification' : 'la création'} du lieu:\n${errorMessage}`,
            duration: 5000,
            color: 'danger',
            position: 'middle',
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
          toast.present();
        }
      });
    } else {
      console.log('Formulaire invalide. Détails des erreurs:');
      Object.keys(this.placeForm.controls).forEach(key => {
        const control = this.placeForm.get(key);
        if (control?.errors) {
          console.log(`Erreurs pour le champ ${key}:`, control.errors);
        }
      });
      this.placeForm.markAllAsTouched();
    }
  }

  navigateToList() {
    this.router.navigate(['/places']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.placeForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Ce champ est requis';
      }
      if (control.errors['minlength']) {
        return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
      }
    }
    return '';
  }
} 