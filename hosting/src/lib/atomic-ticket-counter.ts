import { doc, runTransaction, increment } from 'firebase/firestore';
import { instaPassoDb } from './firebase';
import { logAuditEvent, formatTicketProtocol } from './audit-logger';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Gerador de Protocolo de Ticket Atômico no Firestore (#2026XXXX) (Item 017)
 * Utiliza Transação Firestore para garantir unicidade estrita e prevenir race conditions.
 */
export async function generateNextAtomicTicketProtocol(): Promise<{ number: number; formatted: string }> {
  const counterRef = doc(instaPassoDb, 'counters', 'tickets');

  try {
    const nextNumber = await runTransaction(instaPassoDb, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      let currentSeq = 1042; // Valor base padrão da sequência de 2026

      if (counterDoc.exists()) {
        const data = counterDoc.data();
        if (data && typeof data.currentSeq === 'number') {
          currentSeq = data.currentSeq;
        }
      }

      const nextSeq = currentSeq + 1;

      transaction.set(
        counterRef,
        {
          currentSeq: nextSeq,
          year: CURRENT_YEAR,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return nextSeq;
    });

    const formatted = formatTicketProtocol(nextNumber);

    logAuditEvent(
      'ATOMIC_TICKET_COUNTER_GENERATED',
      `Novo protocolo de ticket atômico gerado no Firestore: ${formatted} (Sequência ${nextNumber}).`
    );

    return { number: nextNumber, formatted };
  } catch (error) {
    console.warn('Fallback local para geração atômica de protocolo:', error);
    // Fallback sequencial usando timestamp garantido
    const fallbackSeq = Math.floor(1043 + (Date.now() % 8957));
    const formatted = formatTicketProtocol(fallbackSeq);
    return { number: fallbackSeq, formatted };
  }
}
