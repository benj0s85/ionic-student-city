import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { environment } from 'src/environments/environment';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(user: User): Observable<AuthResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    console.log('URL d\'inscription:', `${this.API_URL}/api/register`);
    console.log('Données envoyées au serveur:', user);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/api/register`, user, { 
      headers,
      withCredentials: false
    });
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<AuthResponse>(`${this.API_URL}/api/login`, credentials, { 
      headers,
      withCredentials: false
    }).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (!response.user || !response.user.id) {
          console.error('No user data in response');
          throw new Error('Invalid user data received from server');
        }
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.id ?? null;
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.getToken()}`);

    return this.http.put<User>(`${this.API_URL}/api/profile`, userData, { 
      headers,
      withCredentials: false
    }).pipe(
      tap(updatedUser => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser };
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          this.currentUserSubject.next(newUser);
        }
      })
    );
  }

  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.API_URL}/api/profile/${userId}`, {
      oldPassword,
      plainPassword: newPassword
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    } else {
      throw new Error('Token is not available');
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserIdFromToken(): number | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.id || null;
  }

  private getUserIdByEmail(email: string): number | null {
    if (email === 'admin@gmail.com') {
      return 1;
    }
    return null;
  }
} 