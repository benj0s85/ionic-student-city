import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'; // Added OnDestroy
import { Router } from '@angular/router';
import { Place } from '../../../core/models/place.model';
import { PlaceService } from '../../../core/services/place.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { GoogleMapsModule, MapInfoWindow } from '@angular/google-maps';
import { ReviewService } from '../../../core/services/review.service';
import { forkJoin, Subscription } from 'rxjs'; // Added Subscription
import { map } from 'rxjs/operators';
import { NetworkStatusService } from '../../../services/network-status.service'; // Import NetworkStatusService
import { ConnectionStatus } from '@capacitor/network'; // Import ConnectionStatus

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule
  ],
  providers: [DecimalPipe]
})
export class PlacesListComponent implements OnInit, OnDestroy { // Implemented OnDestroy
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  places: Place[] = [];
  filteredPlaces: Place[] = [];
  // cachedPlaces: Place[] = []; // For offline data
  selectedType: string = '';
  searchTerm: string = '';
  sortBy: string = 'name';
  selectedPlace: Place | null = null;
  selectedView: string = 'list';
  reviewedPlaces: Set<number> = new Set();

  isOnline: boolean = true;
  isLoading: boolean = false;
  private networkStatusSubscription: Subscription | undefined;

  // Configuration de la carte
  center: google.maps.LatLngLiteral = {
    lat: 48.8566, // Paris par défaut
    lng: 2.3522
  };
  zoom = 12;

  placeTypes: string[] = [
    'restaurant', 'bar', 'cafe', 'musee', 'parc',
    'monument', 'hotel', 'commerce', 'sport', 'autre'
  ];

  infoWindowOptions: google.maps.InfoWindowOptions = {
    pixelOffset: new google.maps.Size(0, -30),
    maxWidth: 200,
    disableAutoPan: false,
    ariaLabel: 'Informations du lieu'
  };

  constructor(
    private router: Router,
    private placeService: PlaceService,
    private toastController: ToastController,
    private alertController: AlertController,
    private reviewService: ReviewService,
    private networkStatusService: NetworkStatusService // Injected NetworkStatusService
  ) {}

  ngOnInit() {
    this.networkStatusSubscription = this.networkStatusService.getNetworkStatus().subscribe((status: ConnectionStatus | null) => {
      console.log('[PlacesListComponent] Network status update:', status);
      if (status) {
        const onlineStatusChanged = this.isOnline !== status.connected;
        this.isOnline = status.connected;
        console.log('[PlacesListComponent] isOnline set to:', this.isOnline);

        if (onlineStatusChanged && this.isOnline) {
          console.log('[PlacesListComponent] Back online, reloading data.');
          this.loadPlacesAndReviews();
        } else if (!this.isOnline) {
          console.log('[PlacesListComponent] Now offline. Displaying cache or offline message.');
          this.isLoading = false; // Stop loading if it was in progress
          // this.loadPlacesFromCache(); // Implement this
        }
      } else {
        // Fallback if status is null, treat as offline for safety
        this.isOnline = false;
        this.isLoading = false;
        console.log('[PlacesListComponent] Received null network status, assuming offline.');
      }
    });

    // Initial load
    // Give a slight delay for network status to be potentially determined
    setTimeout(() => {
      if (this.networkStatusService.isOnline()) {
        this.loadPlacesAndReviews();
      } else {
        this.isOnline = false; // Ensure UI reflects offline state
        this.isLoading = false;
        console.log('[PlacesListComponent] Initial load, device is offline.');
        // this.loadPlacesFromCache(); // Implement this
      }
    }, 100);
  }

  loadPlacesAndReviews() {
    if (!this.networkStatusService.isOnline()) {
      console.log('[PlacesListComponent] loadPlacesAndReviews called but offline. Aborting.');
      this.isOnline = false; // Ensure UI reflects offline state
      this.isLoading = false;
      // this.loadPlacesFromCache();
      return;
    }

    this.isLoading = true;
    console.log('[PlacesListComponent] Loading places and reviews...');

    // Using forkJoin to wait for both, but handle errors individually if needed
    // For simplicity, we'll let individual calls handle their errors and UI updates.
    // Consider a more robust error handling for forkJoin if all must succeed.

    this.placeService.getPlaces().subscribe({
      next: (places) => {
        this.places = places;
        this.filterPlaces(); // This will also update filteredPlaces
        this.updateMapCenter();
        // this.savePlacesToCache(places); // Implement this
        console.log('[PlacesListComponent] Places loaded.');
        // Only set isLoading to false if both calls are done or if reviews are optional for initial display
      },
      error: async (error) => {
        console.error('[PlacesListComponent] Error loading places:', error);
        this.isLoading = false; // Set loading to false on error
        if (!this.networkStatusService.isOnline()) this.isOnline = false;
        this.showToast('Erreur lors du chargement des lieux', 'danger');
        // this.loadPlacesFromCache();
      },
      complete: () => {
        // If reviewService call is also here, manage isLoading more carefully
        // For now, assume places loading is primary for isLoading
        // this.isLoading = false; // Or manage with forkJoin
      }
    });

    this.reviewService.getUserReviews().subscribe({
      next: (reviews) => {
        this.reviewedPlaces = new Set(reviews.map(review => review.placeId));
        console.log('[PlacesListComponent] User reviews loaded.');
      },
      error: async (error) => {
        console.error('[PlacesListComponent] Error loading user reviews:', error);
        // Don't necessarily stop loading indicator for this, depends on UX
        this.showToast('Erreur lors du chargement des avis utilisateurs', 'warning');
      },
      complete: () => {
        this.isLoading = false; // Set loading to false after both (or primary) calls complete
      }
    });
  }

  // --- Cache Functions (Implement these based on your storage strategy) ---
  // loadPlacesFromCache() {
  //   console.log('[PlacesListComponent] Attempting to load places from cache.');
  //   // Example: const cached = localStorage.getItem('placesCache');
  //   // if (cached) { this.places = JSON.parse(cached); this.filterPlaces(); }
  //   // this.cachedPlaces = ...
  //   this.showToast('Affichage des données sauvegardées (hors-ligne)', 'medium');
  // }

  // savePlacesToCache(placesToCache: Place[]) {
  //   console.log('[PlacesListComponent] Saving places to cache.');
  //   // Example: localStorage.setItem('placesCache', JSON.stringify(placesToCache));
  // }
  // --- End Cache Functions ---

  filterPlaces() {
    let filtered = [...this.places]; // Use current places (could be from cache if offline)

    // Filtre par type
    if (this.selectedType) {
      filtered = filtered.filter(place =>
        place.type.toLowerCase() === this.selectedType.toLowerCase()
      );
    }

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(search) ||
        (place.description && place.description.toLowerCase().includes(search)) ||
        (place.adresse && place.adresse.toLowerCase().includes(search))
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'type': return a.type.toLowerCase().localeCompare(b.type.toLowerCase());
        case 'rating': return (b.averageRating || 0) - (a.averageRating || 0);
        case 'reviewsCount': return (b.reviewCount || 0) - (a.reviewCount || 0);
        default: return 0;
      }
    });
    this.filteredPlaces = filtered;
    // If offline, this.cachedPlaces would be this.filteredPlaces
  }

  updateMapCenter() {
    if (this.filteredPlaces.length > 0) {
      // Calculer le centre à partir de tous les lieux
      const bounds = new google.maps.LatLngBounds();
      this.filteredPlaces.forEach(place => {
        if (place.latitude && place.longitude) {
          bounds.extend({
            lat: place.latitude,
            lng: place.longitude
          });
        }
      });
      
      // Mettre à jour le centre et le zoom
      const center = bounds.getCenter();
      if (center) {
        this.center = {
          lat: center.lat(),
          lng: center.lng()
        };
      }
      // Zoom might need adjustment or use fitBounds if map object is available
    }
  }

  selectPlace(place: Place) {
    this.selectedPlace = place;
    if (place.latitude && place.longitude) {
      this.center = {
        lat: place.latitude,
        lng: place.longitude
      };
      this.zoom = 15;
      
      // Ouvrir l'InfoWindow
      setTimeout(() => {
        if (this.infoWindow && this.isOnline) { // Only open info window if online and map is visible
          this.infoWindow.open();
        }
      }, 100);
    }
  }


  getMarkerOptions(place: Place): google.maps.MarkerOptions {
    return {
      animation: this.selectedPlace?.id === place.id ? google.maps.Animation.BOUNCE : undefined,
      icon: {
        url: this.getMarkerIcon(place.type),
        scaledSize: new google.maps.Size(30, 30)
      }
    };
  }

  getMarkerIcon(type: string): string {
    // Vous pouvez personnaliser les icônes en fonction du type
    const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (type) {
      case 'restaurant': return iconBase + 'red-dot.png';
      case 'bar': case 'cafe': return iconBase + 'blue-dot.png';
      case 'musee': case 'monument': return iconBase + 'yellow-dot.png';
      case 'parc': return iconBase + 'green-dot.png';
      case 'hotel': return iconBase + 'purple-dot.png';
      default: return iconBase + 'red-dot.png';
    }
  }

  getIconByType(type: string | undefined): string {
    switch (type) {
      case 'restaurant': return 'restaurant';
      case 'bar': return 'beer';
      case 'cafe': return 'cafe';
      case 'musee': return 'business'; // Consider a museum icon
      case 'parc': return 'leaf';
      case 'monument': return 'flag'; // Consider a monument icon
      case 'hotel': return 'bed';
      case 'commerce': return 'cart';
      case 'sport': return 'football'; // Or fitness
      default: return 'location';
    }
  }

  hasUserReviewedPlace(placeId: number): boolean {
    return this.reviewedPlaces.has(placeId);
  }

  async ratePlace(place: Place) {
    if (!this.isOnline) {
      this.showToast('Vous devez être en ligne pour noter un lieu.', 'warning');
      return;
    }
    if (this.hasUserReviewedPlace(place.id!)) {
      this.showToast('Vous avez déjà noté cet établissement', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Noter ' + place.name,
      inputs: [
        { name: 'rating', type: 'number', placeholder: 'Votre note (1-5)', min: 1, max: 5 },
        { name: 'comment', type: 'textarea', placeholder: 'Votre commentaire (optionnel)' }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Noter',
          handler: (data) => {
            if (data.rating >= 1 && data.rating <= 5) {
              this.submitRating(place.id!, data.rating, data.comment);
              return true;
            } else {
              this.showToast('La note doit être comprise entre 1 et 5', 'danger');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async submitRating(placeId: number, rating: number, comment: string) {
    if (!this.isOnline) { // Double check
      this.showToast('Connexion perdue. Impossible de soumettre la note.', 'danger');
      return;
    }
    try {
      await this.reviewService.createReview({ placeId, rating, comment }).toPromise();
      this.showToast('Note enregistrée avec succès', 'success');
      this.reviewedPlaces.add(placeId);
      this.loadPlacesAndReviews(); // Recharger pour mettre à jour la moyenne etc.
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la note:', error);
      let errorMessage = 'Erreur lors de l\'enregistrement de la note';
      if (error.error && error.error.message) errorMessage = error.error.message;
      this.showToast(errorMessage, 'danger');
    }
  }

  private async showToast(message: string, color: string, duration: number = 2000) {
    const toast = await this.toastController.create({ message, duration, color });
    toast.present();
  }

  addNewPlace() {
    if (!this.isOnline) {
      this.showToast('Vous devez être en ligne pour ajouter un nouveau lieu.', 'warning');
      return;
    }
    this.router.navigate(['/places/new']);
  }

  viewPlaceDetails(placeId: number) {
    // Navigation should work offline if details page can handle offline state or show cached data
    this.router.navigate(['/places', placeId]);
  }

  ngOnDestroy() {
    if (this.networkStatusSubscription) {
      this.networkStatusSubscription.unsubscribe();
      console.log('[PlacesListComponent] Unsubscribed from network status.');
    }
  }
}