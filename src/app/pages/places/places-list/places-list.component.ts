import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Place } from '../../../core/models/place.model';
import { PlaceService } from '../../../core/services/place.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { GoogleMapsModule, MapInfoWindow } from '@angular/google-maps';

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
export class PlacesListComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  places: Place[] = [];
  filteredPlaces: Place[] = [];
  selectedType: string = '';
  searchTerm: string = '';
  sortBy: string = 'name';
  selectedPlace: Place | null = null;
  selectedView: string = 'list'; // Vue par défaut

  // Configuration de la carte
  center: google.maps.LatLngLiteral = {
    lat: 48.8566, // Paris par défaut
    lng: 2.3522
  };
  zoom = 12;

  placeTypes: string[] = [
    'restaurant',
    'bar',
    'cafe',
    'musee',
    'parc',
    'monument',
    'hotel',
    'commerce',
    'sport',
    'autre'
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
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadPlaces();
  }

  loadPlaces() {
    this.placeService.getPlaces().subscribe({
      next: (places) => {
        this.places = places;
        this.filterPlaces();
        this.updateMapCenter();
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Erreur lors du chargement des lieux',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  filterPlaces() {
    let filtered = [...this.places];

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
        place.description.toLowerCase().includes(search) ||
        place.adresse.toLowerCase().includes(search)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.toLowerCase().localeCompare(b.type.toLowerCase());
        case 'rating':
          const ratingA = a.averageRating || 0;
          const ratingB = b.averageRating || 0;
          return ratingB - ratingA;
        case 'reviewsCount':
          const countA = a.reviewCount || 0;
          const countB = b.reviewCount || 0;
          return countB - countA;
        default:
          return 0;
      }
    });

    this.filteredPlaces = filtered;
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
      this.center = {
        lat: center.lat(),
        lng: center.lng()
      };
      // Le zoom sera ajusté automatiquement par les bounds
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
        if (this.infoWindow) {
          this.infoWindow.open();
        }
      }, 100);
    }
  }

  getMarkerOptions(place: Place): google.maps.MarkerOptions {
    return {
      animation: this.selectedPlace?.id === place.id ? 
        google.maps.Animation.BOUNCE : 
        undefined,
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
      case 'restaurant':
        return iconBase + 'red-dot.png';
      case 'bar':
      case 'cafe':
        return iconBase + 'blue-dot.png';
      case 'musee':
      case 'monument':
        return iconBase + 'yellow-dot.png';
      case 'parc':
        return iconBase + 'green-dot.png';
      case 'hotel':
        return iconBase + 'purple-dot.png';
      default:
        return iconBase + 'red-dot.png';
    }
  }

  getIconByType(type: string | undefined): string {
    switch (type) {
      case 'restaurant':
        return 'restaurant';
      case 'bar':
        return 'beer';
      case 'cafe':
        return 'cafe';
      case 'musee':
        return 'business';
      case 'parc':
        return 'leaf';
      case 'monument':
        return 'business';
      case 'hotel':
        return 'bed';
      case 'commerce':
        return 'cart';
      case 'sport':
        return 'football';
      default:
        return 'location';
    }
  }

  async ratePlace(place: Place) {
    const alert = await this.alertController.create({
      header: 'Noter ' + place.name,
      inputs: [
        {
          name: 'rating',
          type: 'number',
          placeholder: 'Votre note (1-5)',
          min: 1,
          max: 5
        },
        {
          name: 'comment',
          type: 'textarea',
          placeholder: 'Votre commentaire (optionnel)'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            return true;
          }
        },
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

  private async submitRating(placeId: number, rating: number, comment?: string) {
    // TODO: Implémenter l'appel API pour soumettre la note
    this.showToast('Note enregistrée avec succès', 'success');
    this.loadPlaces(); // Recharger les lieux pour mettre à jour les notes
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  addNewPlace() {
    this.router.navigate(['/places/new']);
  }

  viewPlaceDetails(placeId: number) {
    this.router.navigate(['/places', placeId]);
  }
} 