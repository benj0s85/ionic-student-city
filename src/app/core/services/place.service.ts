import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Place } from '../models/place.model';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur HTTP détaillée:', {
      error: error.error,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      name: error.name,
      ok: error.ok,
      headers: error.headers.keys().reduce((acc, key) => ({
        ...acc,
        [key]: error.headers.get(key)
      }), {}),
      url: error.url
    });
    return throwError(() => error);
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token d\'authentification:', token ? 'Présent' : 'Absent');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  private formatPlaceData(place: Place): any {
    const now = new Date().toISOString();
    return {
      name: place.name,
      type: place.type.toLowerCase(),
      adresse: place.adresse,
      description: place.description,
      statut: 'pending',
      createAt: now,
      latitude: place.latitude || null,
      longitude: place.longitude || null
    };
  }

  getPlaces(): Observable<Place[]> {
    console.log('Appel GET pour récupérer tous les lieux');
    return this.http.get<Place[]>(`${this.API_URL}/api/places`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPlace(id: number): Observable<Place> {
    console.log(`Appel GET pour récupérer le lieu ${id}`);
    return this.http.get<Place>(`${this.API_URL}/api/places/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  createPlace(place: Place): Observable<Place> {
    const headers = this.getHeaders();
    const url = `${this.API_URL}/api/places`;
    const placeData = this.formatPlaceData(place);
    
    console.log('Appel POST pour créer un lieu:', {
      url,
      data: placeData,
      headers: headers.keys().reduce((acc, key) => ({
        ...acc,
        [key]: headers.get(key)
      }), {})
    });

    return this.http.post<Place>(url, placeData, {
      headers,
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('Réponse complète du serveur:', {
          status: response.status,
          statusText: response.statusText,
          body: response.body,
          headers: response.headers.keys().reduce((acc, key) => ({
            ...acc,
            [key]: response.headers.get(key)
          }), {})
        });
      }),
      map(response => response.body as Place),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur HTTP détaillée:', {
          error: error.error,
          rawError: JSON.stringify(error.error),
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          name: error.name,
          ok: error.ok,
          headers: error.headers.keys().reduce((acc, key) => ({
            ...acc,
            [key]: error.headers.get(key)
          }), {}),
          url: error.url
        });

        try {
          if (typeof error.error === 'string') {
            console.error('Corps de l\'erreur (parsé):', JSON.parse(error.error));
          }
        } catch (e) {
          console.error('Corps de l\'erreur (brut):', error.error);
        }

        return throwError(() => error);
      })
    );
  }

  updatePlace(id: number, place: Place): Observable<Place> {
    console.log(`Appel PUT pour modifier le lieu ${id}:`, {
      url: `${this.API_URL}/api/places/${id}`,
      data: place,
      headers: this.getHeaders()
    });
    return this.http.put<Place>(`${this.API_URL}/api/places/${id}`, place, {
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
} 