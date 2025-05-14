import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  starOutline, 
  star, 
  searchOutline, 
  chevronDownOutline, 
  addOutline,
  locationOutline,
  menuOutline,
  timeOutline,
  businessOutline
} from 'ionicons/icons';
import { ReviewService, Review } from '../../core/services/review.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;

  constructor(private reviewService: ReviewService) {
    addIcons({
      'star-outline': starOutline,
      'star': star,
      'search-outline': searchOutline,
      'chevron-down-outline': chevronDownOutline,
      'add': addOutline,
      'location': locationOutline,
      'menu': menuOutline,
      'time': timeOutline,
      'business': businessOutline
    });
  }

  ngOnInit() {
    this.loadUserReviews();
  }

  loadUserReviews() {
    this.loading = true;
    this.reviewService.getUserReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis:', error);
        this.loading = false;
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
} 