export interface Place {
    id?: number;
    name: string;
    type: string;
    adresse: string;
    description: string;
    statut?: string;
    createAt?: string;
    latitude?: number;
    longitude?: number;
    user?: number;
    averageRating?: number;
    reviewCount?: number;
} 