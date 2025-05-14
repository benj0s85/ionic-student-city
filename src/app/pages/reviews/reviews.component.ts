import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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

  constructor(private reviewService: ReviewService) {
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
      filtered = filtered.filter(review => 
        review.place?.name.toLowerCase().includes(search) ||
        review.comment?.toLowerCase().includes(search)
      );
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
        review.place?.type.toLowerCase() === this.typeFilter.toLowerCase()
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
    // TODO: Implémenter la modification d'avis
    console.log('Éditer l\'avis:', review);
  }

  async deleteReview(review: Review) {
    // TODO: Implémenter la suppression d'avis
    console.log('Supprimer l\'avis:', review);
  }
} 