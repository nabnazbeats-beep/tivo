/**
 * Format standard pour l'affichage monétaire en Afrique de l'Ouest (FCFA)
 * Espace insécable entre les milliers pour une lisibilité financière optimale.
 */
export function formatFCFA(amount: number | string | null | undefined, showSymbol = true): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return showSymbol ? '0 FCFA' : '0';
  }

  const numericValue = typeof amount === 'string' ? parseFloat(amount.replace(/\s/g, '')) : amount;
  
  // Formatage avec séparateur d'espace français
  const formatted = Math.round(numericValue).toLocaleString('fr-FR').replace(/\u202F/g, ' ');
  
  return showSymbol ? `${formatted} FCFA` : formatted;
}

/**
 * Nettoie une chaîne de saisie de montant
 */
export function sanitizeAmountInput(input: string): string {
  // Conserver uniquement les chiffres
  return input.replace(/[^\d]/g, '');
}

/**
 * Normalisation de base des numéros de téléphone pour le Bénin et Afrique de l'Ouest
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  // Enlève espaces, parenthèses, tirets
  let cleaned = raw.replace(/[\s\(\)\-]/g, '');
  
  // Si commence par 00229
  if (cleaned.startsWith('00229')) {
    cleaned = '+229' + cleaned.slice(5);
  }
  // Si commence par 229 sans le +
  else if (cleaned.startsWith('229') && cleaned.length >= 10) {
    cleaned = '+' + cleaned;
  }
  // Si c'est un numéro national béninois à 8 chiffres (ou 10 selon nouvelle numérotation)
  else if (!cleaned.startsWith('+') && (cleaned.length === 8 || cleaned.length === 10)) {
    cleaned = '+229 ' + formatNationalNumber(cleaned);
    return cleaned;
  }

  return cleaned;
}

function formatNationalNumber(digits: string): string {
  // Regroupe par tranches de 2 chiffres
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}
