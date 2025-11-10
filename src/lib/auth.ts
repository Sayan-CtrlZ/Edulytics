
"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SECRET_KEY || "default-secret-key-for-development";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // In a real application, you would verify the password against a stored hash.
  // For this demo, we'll use a simple check.
  if (email === "teacher@school.edu" && password === "password123") {
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const session = await encrypt({ user: { email }, expires });

    cookies().set("session", session, { expires, httpOnly: true });
    return { success: true };
  }
  return { success: false, error: "Invalid email or password." };
}

export async function logout() {
  cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}
