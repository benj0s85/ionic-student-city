import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';
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
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
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
    console.log('Current User:', this.authService.getCurrentUser());
    console.log('Token:', this.authService.getToken());
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword } = this.passwordForm.value;
      try {
        const userId = this.authService.getUserIdFromToken();
        if (!userId) {
          throw new Error('ID utilisateur non trouvé dans le token');
        }

        await this.authService.changePassword(userId, oldPassword, newPassword).toPromise();
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