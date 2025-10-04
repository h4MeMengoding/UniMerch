export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  address?: string;
  joinDate?: Date;
}
