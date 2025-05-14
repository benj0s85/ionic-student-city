import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ng-container *ngIf="(user$ | async) as user">
        <h2>Informations actuelles</h2>
        <p>Pseudo : {{ user.pseudo }}</p>
        <p>Email : {{ user.email }}</p>
      </ng-container>

      <h2>Modifier mon profil</h2>
      <form [formGroup]="updateForm" (ngSubmit)="onUpdateProfile()">
        <ion-item>
          <ion-label position="floating">Pseudo</ion-label>
          <ion-input formControlName="pseudo" type="text"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Email (si modifiable)</ion-label>
          <ion-input formControlName="email" type="email"></ion-input>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="!updateForm.valid">Mettre à jour</ion-button>
      </form>

      <h2>Changer mon mot de passe</h2>
      <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
        <ion-item>
          <ion-label position="floating">Ancien mot de passe</ion-label>
          <ion-input formControlName="oldPassword" type="password"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Nouveau mot de passe</ion-label>
          <ion-input formControlName="newPassword" type="password"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Confirmer le nouveau mot de passe</ion-label>
          <ion-input formControlName="confirmPassword" type="password"></ion-input>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="!passwordForm.valid">Changer le mot de passe</ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-item { margin-bottom: 10px; }
    h2 { margin-top: 20px; }
  `]
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  updateForm: FormGroup;
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
    this.updateForm = this.fb.group({
      pseudo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]]
    });
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Optionnel : pré-remplir le formulaire de mise à jour avec les données actuelles
    this.user$.pipe(tap(user => {
      if (user) {
        this.updateForm.patchValue({ pseudo: user.pseudo, email: user.email });
      }
    })).subscribe();
  }

  onUpdateProfile() {
    if (this.updateForm.valid) {
      const data: Partial<User> = this.updateForm.value;
      this.authService.updateProfile(data).subscribe(updated => {
        console.log('Profil mis à jour', updated);
        // Optionnel : afficher un toast ou un message de succès
      });
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
      if (newPassword !== confirmPassword) {
         alert('Les mots de passe ne correspondent pas.');
         return;
      }
      // Appelle la méthode (à implémenter dans AuthService) pour changer le mot de passe
      // Exemple : this.authService.changePassword(oldPassword, newPassword).subscribe(...);
    }
  }
} 