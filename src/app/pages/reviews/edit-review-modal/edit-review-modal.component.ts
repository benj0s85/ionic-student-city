import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Review } from '../../../core/services/review.service';

@Component({
  selector: 'app-edit-review-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Modifier l'avis</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Établissement</ion-label>
        <ion-text>{{ review.place?.name }}</ion-text>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Note</ion-label>
        <ion-range
          [(ngModel)]="editedReview.rating"
          min="1"
          max="5"
          step="1"
          snaps="true"
          pin="true"
          color="warning">
          <ion-icon slot="start" name="star-outline"></ion-icon>
          <ion-icon slot="end" name="star"></ion-icon>
        </ion-range>
        <div class="rating-display">
          <ion-icon
            *ngFor="let star of [1,2,3,4,5]"
            [name]="star <= (editedReview.rating || 0) ? 'star' : 'star-outline'"
            [color]="star <= (editedReview.rating || 0) ? 'warning' : 'medium'">
          </ion-icon>
        </div>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Commentaire</ion-label>
        <ion-textarea
          [(ngModel)]="editedReview.comment"
          rows="4"
          placeholder="Votre commentaire...">
        </ion-textarea>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Annuler</ion-button>
          <ion-button (click)="save()" color="primary" [strong]="true">
            Enregistrer
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .rating-display {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-top: 8px;
      
      ion-icon {
        font-size: 24px;
      }
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class EditReviewModalComponent implements OnInit {
  @Input() review!: Review;
  editedReview: Required<Pick<Review, 'rating' | 'comment'>> = {
    rating: 1,
    comment: ''
  };

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.editedReview = {
      rating: this.review.rating,
      comment: this.review.comment
    };
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss(this.editedReview);
  }
} 