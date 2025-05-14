import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  mailOutline, 
  keyOutline, 
  saveOutline,
  checkmarkDoneOutline,
  warningOutline,
  closeOutline,
  menuOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button>
            <ion-icon name="menu-outline"></ion-icon>
          </ion-menu-button>
        </ion-buttons>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ng-container *ngIf="(user$ | async) as user">
        <div class="profile-header">
          <div class="avatar">
            <ion-icon name="person-outline" size="large"></ion-icon>
          </div>
          <div class="user-info">
            <h2>{{ user.pseudo }}</h2>
            <p>{{ user.email }}</p>
            <ion-badge color="primary">{{ user.status || 'En attente' }}</ion-badge>
          </div>
        </div>

        <ion-segment [(ngModel)]="currentSegment" (ionChange)="segmentChanged($event)">
          <ion-segment-button value="info">
            <ion-label>Informations</ion-label>
          </ion-segment-button>
          <ion-segment-button value="password">
            <ion-label>Mot de passe</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div [ngSwitch]="currentSegment">
          <div *ngSwitchCase="'info'">
            <form [formGroup]="updateForm" (ngSubmit)="onUpdateProfile()" class="form-container">
              <ion-item>
                <ion-icon name="person-outline" slot="start"></ion-icon>
                <ion-label position="floating">Pseudo</ion-label>
                <ion-input formControlName="pseudo" type="text"></ion-input>
                <ion-note slot="error" *ngIf="updateForm.get('pseudo')?.errors?.['required'] && updateForm.get('pseudo')?.touched">
                  Le pseudo est requis
                </ion-note>
                <ion-note slot="error" *ngIf="updateForm.get('pseudo')?.errors?.['minlength'] && updateForm.get('pseudo')?.touched">
                  Le pseudo doit contenir au moins 3 caractères
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-icon name="mail-outline" slot="start"></ion-icon>
                <ion-label position="floating">Email</ion-label>
                <ion-input formControlName="email" type="email"></ion-input>
                <ion-note slot="error" *ngIf="updateForm.get('email')?.errors?.['email'] && updateForm.get('email')?.touched">
                  Format d'email invalide
                </ion-note>
              </ion-item>

              <ion-button expand="block" type="submit" [disabled]="!updateForm.valid || updateForm.pristine" class="ion-margin-top">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                Mettre à jour
              </ion-button>
            </form>
          </div>

          <div *ngSwitchCase="'password'">
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="form-container">
              <ion-item>
                <ion-icon name="key-outline" slot="start"></ion-icon>
                <ion-label position="floating">Ancien mot de passe</ion-label>
                <ion-input formControlName="oldPassword" type="password"></ion-input>
                <ion-note slot="error" *ngIf="passwordForm.get('oldPassword')?.errors?.['required'] && passwordForm.get('oldPassword')?.touched">
                  L'ancien mot de passe est requis
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-icon name="key-outline" slot="start"></ion-icon>
                <ion-label position="floating">Nouveau mot de passe</ion-label>
                <ion-input formControlName="newPassword" type="password"></ion-input>
                <ion-note slot="error" *ngIf="passwordForm.get('newPassword')?.errors?.['required'] && passwordForm.get('newPassword')?.touched">
                  Le nouveau mot de passe est requis
                </ion-note>
                <ion-note slot="error" *ngIf="passwordForm.get('newPassword')?.errors?.['minlength'] && passwordForm.get('newPassword')?.touched">
                  Le mot de passe doit contenir au moins 6 caractères
                </ion-note>
              </ion-item>

              <ion-item>
                <ion-icon name="checkmark-done-outline" slot="start"></ion-icon>
                <ion-label position="floating">Confirmer le nouveau mot de passe</ion-label>
                <ion-input formControlName="confirmPassword" type="password"></ion-input>
                <ion-note slot="error" *ngIf="passwordForm.get('confirmPassword')?.errors?.['required'] && passwordForm.get('confirmPassword')?.touched">
                  La confirmation du mot de passe est requise
                </ion-note>
                <ion-note slot="error" *ngIf="passwordForm.errors?.['passwordMismatch']">
                  Les mots de passe ne correspondent pas
                </ion-note>
              </ion-item>

              <ion-button expand="block" type="submit" [disabled]="!passwordForm.valid" class="ion-margin-top">
                <ion-icon name="save-outline" slot="start"></ion-icon>
                Changer le mot de passe
              </ion-button>
            </form>
          </div>
        </div>
      </ng-container>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;

      ion-icon {
        font-size: 40px;
        color: white;
      }
    }

    .user-info {
      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ion-color-dark);
      }

      p {
        margin: 0.5rem 0;
        color: var(--ion-color-medium);
      }

      ion-badge {
        text-transform: capitalize;
      }
    }

    ion-segment {
      margin-bottom: 1rem;
    }

    .form-container {
      margin-top: 1rem;
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 1rem;
      border-radius: 8px;
      --background: var(--ion-color-light);

      ion-icon {
        color: var(--ion-color-primary);
      }
    }

    ion-button {
      margin-top: 1.5rem;
      --border-radius: 8px;
    }

    ion-note {
      color: var(--ion-color-danger);
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  updateForm: FormGroup;
  passwordForm: FormGroup;
  currentSegment = 'info';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private toastCtrl: ToastController
  ) {
    this.user$ = this.authService.currentUser$;
    
    this.updateForm = this.fb.group({
      pseudo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    addIcons({
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'key-outline': keyOutline,
      'save-outline': saveOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'warning-outline': warningOutline,
      'close-outline': closeOutline,
      'menu-outline': menuOutline
    });
  }

  ngOnInit() {
    this.user$.pipe(
      tap(user => {
        if (user) {
          this.updateForm.patchValue({
            pseudo: user.pseudo,
            email: user.email
          });
        }
      })
    ).subscribe();
  }

  segmentChanged(event: any) {
    this.currentSegment = event.detail.value;
  }

  async onUpdateProfile() {
    if (this.updateForm.valid && this.updateForm.dirty) {
      const data: Partial<User> = this.updateForm.value;
      try {
        await this.authService.updateProfile(data).toPromise();
        await this.showToast('Profil mis à jour avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        await this.showToast('Erreur lors de la mise à jour du profil', 'danger');
      }
    }
  }

  async onChangePassword() {
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword } = this.passwordForm.value;
      try {
        await this.showToast('Mot de passe modifié avec succès', 'success');
        this.passwordForm.reset();
        this.currentSegment = 'info';
      } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        await this.showToast('Erreur lors du changement de mot de passe', 'danger');
      }
    }
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 