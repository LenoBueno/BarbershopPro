/**
 * Script to register root@root.com user
 * 
 * This is a one-time setup script to create the test user.
 * The Edge Function 'create-user' will handle the registration.
 * 
 * User credentials:
 * - Email: root@root.com
 * - Password: 14875021
 * - Name: Root User
 * - Phone: (11) 99999-9999
 * - Barbershop: Barbearia Premium
 */

import { createUserAdmin } from '../services/userService';

const BARBERSHOP_ID = '11111111-1111-1111-1111-111111111111';

export async function registerRootUser() {
  console.log('Creating root user...');
  
  const result = await createUserAdmin({
    email: 'root@root.com',
    password: '14875021',
    name: 'Root User',
    phone: '(11) 99999-9999',
    barbershopId: BARBERSHOP_ID,
  });

  if (result.error) {
    console.error('Failed to create user:', result.error);
    return false;
  }

  console.log('Root user created successfully!', result.data);
  return true;
}

// Uncomment to run directly
// registerRootUser();
