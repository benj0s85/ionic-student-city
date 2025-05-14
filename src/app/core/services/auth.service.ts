import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { environment } from 'src/environments/environment';

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
} 