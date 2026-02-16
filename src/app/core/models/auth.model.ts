export interface AuthRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
  
  export interface AuthResponse {
    token: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  }
  
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }