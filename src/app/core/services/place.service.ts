import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Place } from '../models/place.model';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface PlaceCreateRequest {
  name: string;
  type: 'Restaurant' | 'Bar' | 'Bibliotheque' | 'Salle_sport';
  adresse: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private readonly API_URL = environment.apiUrl;
  private readonly PLACE_TYPES = ['Restaurant', 'Bar', 'Bibliotheque', 'Salle_sport'] as const;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  private formatPlaceData(place: Partial<Place>): PlaceCreateRequest {
    // Vérifier que le type est valide
    if (!place.type || !this.PLACE_TYPES.includes(place.type as any)) {
      throw new Error('Type d\'établissement invalide. Les types valides sont : ' + this.PLACE_TYPES.join(', '));
    }

    // Ne renvoyer que les champs attendus par l'API
    const formattedData: PlaceCreateRequest = {
      name: place.name!,
      type: place.type as PlaceCreateRequest['type'],
      adresse: place.adresse!,
      description: place.description!
    };

    // Ajouter les coordonnées si elles sont définies et non nulles
    if (typeof place.latitude === 'number' && !isNaN(place.latitude)) {
      formattedData.latitude = place.latitude;
    }
    if (typeof place.longitude === 'number' && !isNaN(place.longitude)) {
      formattedData.longitude = place.longitude;
    }

    // Log des données formatées
    console.log('Données formatées pour l\'API:', {
      original: place,
      formatted: formattedData
    });

    return formattedData;
  }

  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.API_URL}/api/places`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPlace(id: number): Observable<Place> {
    return this.http.get<Place>(`${this.API_URL}/api/places/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  createPlace(place: Partial<Place>): Observable<Place> {
    const headers = this.getHeaders();
    const url = `${this.API_URL}/api/places`;
    
    try {
      const placeData = this.formatPlaceData(place);
      console.log('Requête complète:', {
        url,
        headers: headers.keys().reduce((acc, key) => ({ ...acc, [key]: headers.get(key) }), {}),
        body: placeData
      });

      return this.http.post<Place>(url, placeData, { headers }).pipe(
        tap(response => {
          console.log('Réponse de l\'API:', response);
        }),
        catchError(error => {
          console.error('Erreur détaillée:', {
            error: error.error,
            status: error.status,
            message: error.message,
            data: placeData,
            rawError: error
          });

          if (error instanceof HttpErrorResponse) {
            let errorMessage = 'Une erreur est survenue';
            
            if (error.error) {
              if (typeof error.error === 'string') {
                try {
                  const parsedError = JSON.parse(error.error);
                  errorMessage = this.formatErrorMessage(parsedError);
                } catch {
                  errorMessage = error.error;
                }
              } else if (typeof error.error === 'object') {
                errorMessage = this.formatErrorMessage(error.error);
              }
            }
            
            return throwError(() => new Error(errorMessage));
          }
          
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  private formatErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.join(', ');
    }
    if (error.violations) {
      return error.violations.map((v: any) => `${v.propertyPath}: ${v.message}`).join(', ');
    }
    if (typeof error === 'object') {
      return Object.entries(error)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return 'Une erreur inconnue est survenue';
  }

  updatePlace(id: number, place: Partial<Place>): Observable<Place> {
    const placeData = this.formatPlaceData(place);
    return this.http.put<Place>(`${this.API_URL}/api/places/${id}`, placeData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deletePlace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/api/places/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur HTTP détaillée:', {
      error: error.error,
      status: error.status,
      message: error.message,
      rawError: error
    });

    return throwError(() => error);
  }
} 