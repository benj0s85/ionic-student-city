import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  starOutline, 
  star, 
  searchOutline, 
  chevronDownOutline, 
  createOutline,
  trashOutline,
  businessOutline,
  timeOutline
} from 'ionicons/icons';
import { ReviewService, Review } from '../../core/services/review.service';
import { EditReviewModalComponent } from './edit-review-modal/edit-review-modal.component';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  loading = true;
  error: string | null = null;

  // Filtres
  searchTerm = '';
  studentNameFilter = '';
  ratingFilter = '';
  typeFilter = '';

  constructor(
    private reviewService: ReviewService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      'star-outline': starOutline,
      'star': star,
      'search-outline': searchOutline,
      'chevron-down-outline': chevronDownOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'business': businessOutline,
      'time-outline': timeOutline
    });
  }

  ngOnInit() {
    this.loadUserReviews();
  }

  loadUserReviews() {
    this.loading = true;
    this.error = null;
    
    this.reviewService.getUserReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.filterReviews();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis:', error);
        this.error = 'Impossible de charger vos avis. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  filterReviews() {
    let filtered = [...this.reviews];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(review => {
        const placeName = review.place?.name?.toLowerCase() || '';
        const comment = review.comment?.toLowerCase() || '';
        return placeName.includes(search) || comment.includes(search);
      });
    }

    // Filtre par note
    if (this.ratingFilter) {
      filtered = filtered.filter(review => 
        review.rating === parseInt(this.ratingFilter)
      );
    }

    // Filtre par type d'établissement
    if (this.typeFilter) {
      filtered = filtered.filter(review => 
        review.place?.type?.toLowerCase() === this.typeFilter.toLowerCase()
      );
    }

    this.filteredReviews = filtered;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  async editReview(review: Review) {
    if (!review.id) {
      await this.showToast('Impossible de modifier cet avis : ID manquant', 'danger');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: EditReviewModalComponent,
      componentProps: {
        review: review
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      this.loading = true;
      this.reviewService.updateReview(review.id, data).subscribe({
        next: (updatedReview) => {
          const index = this.reviews.findIndex(r => r.id === review.id);
          if (index !== -1) {
            this.reviews[index] = { ...this.reviews[index], ...updatedReview };
            this.filterReviews();
          }
          this.loading = false;
          this.showToast('Avis modifié avec succès', 'success');
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.loading = false;
          this.showToast('Erreur lors de la modification de l\'avis', 'danger');
        }
      });
    }
  }

  async deleteReview(review: Review) {
    if (!review.id) {
      await this.showToast('Impossible de supprimer cet avis : ID manquant', 'danger');
      return;
    }

    const alert = await this.toastCtrl.create({
      header: 'Confirmation',
      message: 'Voulez-vous vraiment supprimer cet avis ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.loading = true;
            this.reviewService.deleteReview(review.id!).subscribe({
              next: () => {
                this.reviews = this.reviews.filter(r => r.id !== review.id);
                this.filterReviews();
                this.loading = false;
                this.showToast('Avis supprimé avec succès', 'success');
              },
              error: (error: unknown) => {
                console.error('Erreur lors de la suppression:', error);
                this.loading = false;
                this.showToast('Erreur lors de la suppression de l\'avis', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
} 