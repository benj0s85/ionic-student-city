export interface User {
    id?: number;
    pseudo: string;
    email: string;
    password?: string;
    roles?: string[];
    status?: 'pending' | 'validated' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AuthResponse {
    token: string;
    user: User;
} 