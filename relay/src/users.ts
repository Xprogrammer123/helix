import crypto from 'crypto';
import type { RadonUser } from '@radonsdk/auth';
import { auth } from './auth.js';
import { db, DB_ID, ID, Query } from './db.js';
import type { UserDoc } from './plan.js';

function usernameFromEmail(email: string): string {
  const base = email.split('@')[0]?.replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
  return base.slice(0, 32) || 'user';
}

async function findUserByRadonId(radonUserId: string): Promise<UserDoc | null> {
  const match = await db.listDocuments(DB_ID, 'users', [
    Query.equal('radon_user_id', radonUserId),
  ]);
  if (match.total === 0) return null;
  return match.documents[0] as UserDoc;
}

export async function findOrCreateUserFromRadon(radonUser: RadonUser): Promise<UserDoc> {
  const existing = await findUserByRadonId(radonUser.id);
  if (existing) return existing;

  const email = radonUser.email?.trim().toLowerCase();
  if (email) {
    const byEmail = await db.listDocuments(DB_ID, 'users', [Query.equal('email', email)]);
    if (byEmail.total > 0) {
      const user = byEmail.documents[0] as UserDoc;
      await db.updateDocument(DB_ID, 'users', user.$id, { radon_user_id: radonUser.id });
      return { ...user, radon_user_id: radonUser.id };
    }
  }

  let username = email ? usernameFromEmail(email) : `user_${radonUser.id.slice(0, 8)}`;
  const taken = await db.listDocuments(DB_ID, 'users', [Query.equal('username', username)]);
  if (taken.total > 0) {
    username = `${username}_${radonUser.id.slice(0, 6)}`;
  }

  return (await db.createDocument(DB_ID, 'users', ID.unique(), {
    radon_user_id: radonUser.id,
    email: email ?? null,
    username,
    token: crypto.randomUUID(),
    name: email?.split('@')[0] || username,
    plan: 'free',
  })) as UserDoc;
}

/** @deprecated Legacy Appwrite API token */
async function findUserByLegacyToken(token: string): Promise<UserDoc | null> {
  const match = await db.listDocuments(DB_ID, 'users', [Query.equal('token', token)]);
  if (match.total === 0) return null;
  return match.documents[0] as UserDoc;
}

export async function resolveUserFromAuth(token: string): Promise<UserDoc | null> {
  if (!token) return null;

  try {
    const claims = auth.verifyToken(token);
    let user = await findUserByRadonId(claims.sub);
    if (!user) {
      const radonUser = await auth.getSessionUser(token);
      user = await findOrCreateUserFromRadon(radonUser);
    }
    return user;
  } catch {
    return findUserByLegacyToken(token);
  }
}
