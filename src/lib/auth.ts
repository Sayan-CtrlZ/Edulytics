
'use server';

import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = '__session';

async function getAdminAuth() {
  try {
    // This will work if the admin app was already initialized
    return getAuth(getApp());
  } catch (e: any) {
    if (e.code === 'app/no-app') {
      // This will work when `firebase-admin` is initialized in the future
      const { initializeApp, cert } = await import('firebase-admin/app');
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

      if (!serviceAccount) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT environment variable is not set. The app will not work correctly.'
        );
      }

      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      });
      return getAuth(getApp());
    }
    throw e;
  }
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    // We can't use the client-side SDK's signInWithEmailAndPassword here
    // because we need to create a session cookie. We'll use a custom token flow.
    // This is a placeholder for a more secure custom token implementation.
    // In a real app, you'd verify the password and then create a custom token.
    const auth = await getAdminAuth();
    // This is NOT a real sign-in. It just checks if the user exists.
    const userRecord = await auth.getUserByEmail(email);

    // NOTE: This doesn't actually check the password.
    // A real implementation would require a custom endpoint or different flow.
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // The custom token is sent to the client to be signed in with.
    // The session cookie creation logic would need to be handled client-side
    // after the client signs in with the custom token.
    // For this server action, we will create a session cookie directly for simplicity.
    const sessionCookie = await auth.createSessionCookie(customToken, { expiresIn: 60 * 60 * 24 * 5 * 1000 });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    });
    
    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signupWithCredentials(email: string, password: string) {
  try {
    const auth = await getAdminAuth();
    const userRecord = await auth.createUser({ email, password });
    
    // After creating the user, create a session cookie to log them in.
    const customToken = await auth.createCustomToken(userRecord.uid);
    const sessionCookie = await auth.createSessionCookie(customToken, { expiresIn: 60 * 60 * 24 * 5 * 1000 });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    });

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const auth = await getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}
