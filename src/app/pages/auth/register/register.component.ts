import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.registerForm = this.formBuilder.group({
      pseudo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.registerForm.valid) {
      try {
        console.log('Données envoyées:', this.registerForm.value);
        await this.authService.register(this.registerForm.value).toPromise();
        const toast = await this.toastController.create({
          message: 'Inscription réussie ! Votre compte est en attente de validation par un administrateur.',
          duration: 3000,
          color: 'success'
        });
        toast.present();
        this.router.navigate(['/auth/login']);
      } catch (error: any) {
        console.error('Erreur détaillée:', error);
        const toast = await this.toastController.create({
          message: error.error?.message || 
                  `Une erreur est survenue l'inscription: ${error.status} ${error.statusText}`,
          duration: 5000,
          color: 'danger'
        });
        toast.present();
      }
    }
  }
} 