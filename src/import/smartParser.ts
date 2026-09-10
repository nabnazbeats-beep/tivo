import { normalizePhoneNumber } from '../design-system/tokens/typography';

export interface ParsedTransaction {
  type: 'deposit' | 'withdrawal';
  amount: number;
  clientPhone: string;
  clientName?: string;
  networkId: string;
  timeStr?: string;
  dateStr?: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0 - 100
  rawText: string;
}

/**
 * Analyseur intelligent de SMS Mobile Money adapté au Bénin et à l'Afrique de l'Ouest.
 * Comprend les formulations de MTN MoMo, Moov Money, Celtis Cash et autres opérateurs.
 */
export function parseMobileMoneySMS(rawText: string): ParsedTransaction {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Détection du type (Dépôt / Retrait)
  let type: 'deposit' | 'withdrawal' = 'deposit';
  if (
    lower.includes('retire') ||
    lower.includes('retrait') ||
    lower.includes('retirez') ||
    lower.includes('cash out')
  ) {
    type = 'withdrawal';
  } else if (
    lower.includes('envoye') ||
    lower.includes('envoyé') ||
    lower.includes('transfert') ||
    lower.includes('transfere') ||
    lower.includes('transféré') ||
    lower.includes('paiement') ||
    lower.includes('débité') ||
    lower.includes('debite') ||
    lower.includes('depot') ||
    lower.includes('dépôt')
  ) {
    type = 'deposit';
  } else if (lower.includes('recu') || lower.includes('reçu') || lower.includes('credit')) {
    // Si l'agent a reçu un transfert, c'est un encaissement (retrait client)
    type = 'withdrawal';
  }

  // 2. Détection du montant (FCFA / F CFA / XOF / F)
  let amount = 0;
  // Match : "25000 FCFA", "25 000 FCFA", "montant de 25000", "25000F"
  const amountRegexes = [
    /(\d[\d\s]*\d|\d+)\s*(?:fcfa|f\s*cfa|xof|f\b)/i,
    /(?:montant(?:\s+de)?|somme(?:\s+de)?)\s*:?\s*(\d[\d\s]*\d|\d+)/i,
    /(?:envoye|retire|recu)\s+(\d[\d\s]*\d|\d+)/i,
  ];

  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const cleanNum = match[1].replace(/\s/g, '');
      const parsed = parseInt(cleanNum, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000000) {
        amount = parsed;
        break;
      }
    }
  }

  // 3. Détection du numéro de téléphone
  let clientPhone = '';
  // Formats : "+229 97 45 12 89", "22997451289", "97451289"
  const phoneRegexes = [
    /(?:\+229|00229|229)?\s*([4569]\d(?:\s*\d{2}){3}|\d{8})/g,
  ];

  for (const regex of phoneRegexes) {
    const matches = Array.from(text.matchAll(regex));
    if (matches.length > 0) {
      // Prendre le premier numéro qui ne ressemble pas au solde
      for (const m of matches) {
        const candidate = m[0].replace(/\s/g, '');
        if (candidate.length >= 8 && candidate.length <= 14) {
          clientPhone = normalizePhoneNumber(candidate);
          break;
        }
      }
    }
    if (clientPhone) break;
  }

  // 4. Détection du nom du client
  let clientName = '';
  // Formats fréquents : "(KPADONOU Sedami)", "a Comlan DOSSOU", "au 229... (Nom)", "vers Nom"
  const nameInParensMatch = text.match(/\(([A-Za-zÀ-ÖØ-öø-ÿ\s\.\-]{3,35})\)/);
  if (nameInParensMatch && nameInParensMatch[1] && !nameInParensMatch[1].toLowerCase().includes('solde')) {
    clientName = nameInParensMatch[1].trim();
  } else {
    const toNameMatch = text.match(/(?:a|au|vers|de)\s+([A-ZÀ-Ö][a-zà-öø-ÿ]+(?:\s+[A-ZÀ-Ö][a-zà-öø-ÿ]+)+)/);
    if (toNameMatch && toNameMatch[1]) {
      clientName = toNameMatch[1].trim();
    }
  }

  // 5. Détection de l'opérateur réseau
  let networkId = 'other';
  if (lower.includes('mtn') || lower.includes('momo')) {
    networkId = 'mtn';
  } else if (lower.includes('moov')) {
    networkId = 'moov';
  } else if (lower.includes('celtis')) {
    networkId = 'celtis';
  } else if (lower.includes('smt') || lower.includes('wave')) {
    networkId = 'smt';
  } else if (clientPhone) {
    // Déduction par préfixe béninois si non explicitement nommé
    const clean = clientPhone.replace(/[^\d]/g, '');
    let prefix = '';
    if (clean.startsWith('229') && clean.length >= 5) {
      prefix = clean.slice(3, 5);
    } else if (clean.length >= 2) {
      prefix = clean.slice(0, 2);
    }

    if (['97', '96', '61', '62', '51', '52', '53', '54'].includes(prefix)) {
      networkId = 'mtn';
    } else if (['95', '94', '63', '64', '65', '55'].includes(prefix)) {
      networkId = 'moov';
    } else if (['40', '41', '42', '43', '98', '99'].includes(prefix)) {
      networkId = 'celtis';
    }
  }

  // 6. Détection de date et heure si présentes
  let timeStr = '';
  let dateStr = '';
  const timeMatch = text.match(/(\d{1,2})[h:](\d{2})/i);
  if (timeMatch) {
    timeStr = `${String(timeMatch[1]).padStart(2, '0')}:${timeMatch[2]}`;
  } else {
    const now = new Date();
    timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  const dateMatch = text.match(/(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?/);
  if (dateMatch) {
    dateStr = dateMatch[0];
  } else {
    dateStr = "Aujourd'hui";
  }

  // 7. Calcul du score de confiance et fiabilité
  let score = 30;
  if (amount > 0) score += 30;
  if (clientPhone.length >= 8) score += 20;
  if (networkId !== 'other') score += 10;
  if (clientName) score += 10;

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (score >= 80) confidence = 'high';
  else if (score >= 50) confidence = 'medium';

  return {
    type,
    amount,
    clientPhone,
    clientName,
    networkId,
    timeStr,
    dateStr,
    confidence,
    confidenceScore: Math.min(score, 98),
    rawText,
  };
}

/**
 * Exemples de SMS typiques pour les tests
 */
export const SAMPLE_SMS_DATA = [
  {
    title: 'MTN Bénin — Dépôt classique',
    source: 'SMS propre',
    text: 'Vous avez envoye 25000 FCFA au 22997451289 (KPADONOU Sedami). Frais: 0 FCFA. Nouveau solde: 410000 FCFA. ID Transaction: 18294729102.',
  },
  {
    title: 'Moov Money — Retrait client',
    source: 'SMS propre',
    text: 'Transfert effectue avec succes. Vous avez retire 15000 FCFA aupres de Comlan DOSSOU (22995308812) le 09/09 a 15:50. Solde: 300000 FCFA.',
  },
  {
    title: 'Celtis Cash — Dépôt avec numéro local',
    source: 'Téléphone à touches',
    text: 'CELTIS CASH: Transfert de 40000 F vers 40112233 (Bernadette AGBO) valide. Ref: CT91024.',
  },
  {
    title: 'SMS Partiel — Sans nom',
    source: 'SMS partiel',
    text: 'Votre compte MoMo a envoye 10000 FCFA au 22961234567. Ref: 981240.',
  },
];
