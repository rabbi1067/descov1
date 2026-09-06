import { User } from '../types';
import { mockUsers } from '../data/mockUsers';

/**
 * Returns all active registered users from the synchronized directory.
 */
export const getStoredUsers = (): User[] => {
  try {
    const saved = localStorage.getItem('desco_users_directory');
    if (saved) {
      const parsed: User[] = JSON.parse(saved);
      const DEMO_EMAILS = new Set(['admin@desco.com', 'user@desco.com', 'sabbir@gmail.com', 'super@desco.com']);
      const cleansed = parsed.filter((u) => !DEMO_EMAILS.has(u.email) && u.id !== 'usr-fazle-rabbi');
      if (cleansed.length === 0) return mockUsers;
      return cleansed.map((u) =>
        u.id === 'usr-super-root' || u.email === 'fazlerabbii2000@gmail.com' ? mockUsers[0] : u
      );
    }
    return mockUsers;
  } catch {
    return mockUsers;
  }
};
