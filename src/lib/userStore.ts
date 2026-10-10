import fs from 'fs';
import path from 'path';
import { hashPassword, verifyPassword } from './security';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  grade: string;
  passwordHash?: string;
  salt?: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  role?: 'student' | 'admin';
  registeredAt: string;
  lastLoginAt: string;
}

export type SafeUser = Omit<StoredUser, 'passwordHash' | 'salt' | 'mfaSecret'>;

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory fallback cache for serverless environments where filesystem is read-only
let inMemoryUsersCache: StoredUser[] | null = null;

function getInitialSeedUsers(): StoredUser[] {
  // In production, NEVER seed accounts or default passwords
  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  // Sample student demo accounts for local development and offline unit tests only (NO admin accounts)
  return [
    {
      id: 'usr_sample_1',
      name: 'ವಿನಯ್ ಕುಮಾರ್',
      email: 'vinay.kumar@example.com',
      grade: '10',
      role: 'student',
      registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastLoginAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'usr_sample_2',
      name: 'ಅನನ್ಯ ಭಟ್',
      email: 'ananya.bhat@example.com',
      grade: '10',
      role: 'student',
      registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastLoginAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'usr_sample_3',
      name: 'ಪ್ರಶಾಂತ್ ಗೌಡ',
      email: 'prashanth.gowda@example.com',
      grade: '9',
      role: 'student',
      registeredAt: new Date(Date.now() - 86400000).toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
  ];
}

function initStore(): StoredUser[] {
  if (inMemoryUsersCache !== null) {
    return inMemoryUsersCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {
        // Read-only filesystem in serverless
      }
    }

    if (!fs.existsSync(USERS_FILE)) {
      const initialUsers = getInitialSeedUsers();
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
      } catch {
        // Ignore file write failure in serverless environment
      }
      inMemoryUsersCache = initialUsers;
      return initialUsers;
    }

    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed: StoredUser[] = JSON.parse(raw);

    inMemoryUsersCache = parsed;
    return parsed;
  } catch (err) {
    console.error('Secure userStore initialization failed, using in-memory store');
    const fallback = getInitialSeedUsers();
    inMemoryUsersCache = fallback;
    return fallback;
  }
}

function saveUsers(users: StoredUser[]) {
  inMemoryUsersCache = users;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // Expected on serverless hosting (Vercel) when local disk is read-only
  }
}

// Strip all sensitive credentials before returning to UI/API
export function sanitizeUser(user: StoredUser): SafeUser {
  const { passwordHash: _ph, salt: _s, mfaSecret: _m, ...safe } = user;
  return safe;
}

export function getAllUsers(): SafeUser[] {
  const users = initStore();
  return users.map(sanitizeUser);
}

export function findUserByEmail(email: string): StoredUser | null {
  if (!email) return null;
  const users = initStore();
  const normalized = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function recordUserRegistration(
  name: string,
  email: string,
  grade: string = '',
  password?: string
): { success: boolean; user?: SafeUser; error?: string } {
  const users = initStore();
  const normalizedEmail = email.toLowerCase().trim();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    return {
      success: false,
      error: 'ಈ ಇಮೇಲ್‌ನೊಂದಿಗೆ ಈಗಾಗಲೇ ಖಾತೆ ಅಸ್ತಿತ್ವದಲ್ಲಿದೆ (Account already exists with this email)',
    };
  }

  if (!password || password.length < 8) {
    return {
      success: false,
      error: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು (Password must be at least 8 characters)',
    };
  }

  const { hash, salt } = hashPassword(password);

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name || 'ವಿದ್ಯಾರ್ಥಿ',
    email: normalizedEmail,
    grade: grade || '10',
    role: 'student', // All public registrations are strictly assigned student role.
    passwordHash: hash,
    salt,
    registeredAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users.unshift(newUser);
  saveUsers(users);
  return { success: true, user: sanitizeUser(newUser) };
}

// Strictly verify credentials. Rejects empty, wrong, or missing passwords without exception.
export function verifyUserCredentials(email: string, password?: string): SafeUser | null {
  if (!email || !password || typeof password !== 'string' || password.trim().length === 0) {
    return null;
  }

  const users = initStore();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || !user.passwordHash || !user.salt) {
    return null;
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return null;
  }

  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  return sanitizeUser(user);
}

export function recordUserLogin(email: string, password?: string): SafeUser | null {
  return verifyUserCredentials(email, password);
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  if (!email || !newPassword || newPassword.length < 8) {
    return false;
  }
  const users = initStore();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return false;
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  saveUsers(users);
  return true;
}

export function getUserStats() {
  const users = initStore();
  const total = users.length;
  const gradeCounts: Record<string, number> = {};

  users.forEach((u) => {
    const g = u.grade || 'ಇತರ';
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  });

  return {
    total,
    gradeCounts,
    recent: users.slice(0, 10).map(sanitizeUser),
  };
}
