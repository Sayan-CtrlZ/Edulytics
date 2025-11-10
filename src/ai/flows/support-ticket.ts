
'use server';
/**
 * @fileOverview A support ticket creation flow.
 *
 * - createSupportTicket - A function that handles creating a support ticket in Firestore.
 * - SupportTicketInput - The input type for the createSupportTicket function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized
function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp();
}

const SupportTicketInputSchema = z.object({
  subject: z.string().describe('The subject of the support ticket.'),
  message: z.string().describe('The main content of the support ticket.'),
  userEmail: z.string().email().describe('The email address of the user submitting the ticket.'),
  userId: z.string().describe('The UID of the user submitting the ticket.'),
});
export type SupportTicketInput = z.infer<typeof SupportTicketInputSchema>;

export async function createSupportTicket(input: SupportTicketInput): Promise<void> {
  return createSupportTicketFlow(input);
}

const createSupportTicketFlow = ai.defineFlow(
  {
    name: 'createSupportTicketFlow',
    inputSchema: SupportTicketInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const db = getFirestore(getFirebaseAdminApp());
    const ticketRef = db.collection('support-tickets').doc();

    await ticketRef.set({
      ...input,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  }
);
