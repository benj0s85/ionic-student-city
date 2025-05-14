import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface Review {
  id?: number;
  rating: number;
  comment: string;
  placeId: number;
  userId?: number;
  createdAt?: string;
  place?: {
    id: number;
    name: string;
    type: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur HTTP détaillée:', error);
    return throwError(() => error);
  }

  createReview(review: Partial<Review>): Observable<Review> {
    // Formatage des données selon l'attente exacte du contrôleur Symfony
    const reviewData = {
      place_id: review.placeId,
      rating: parseInt(review.rating!.toString()),
      commentaire: review.comment || ''
    };

    console.log('Données envoyées à l\'API:', reviewData);

    return this.http.post<Review>(`${this.API_URL}/api/reviews`, reviewData, { 
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getUserReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/api/reviews/user`, { 
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPlaceReviews(placeId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/api/reviews/place/${placeId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  hasUserReviewedPlace(placeId: number): Observable<boolean> {
    return this.getUserReviews().pipe(
      map(reviews => reviews.some(review => review.placeId === placeId))
    );
  }
} 