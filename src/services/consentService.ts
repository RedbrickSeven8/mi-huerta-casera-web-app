const CONSENT_GIVEN_KEY = 'mi_huerta_casera_legal_consent_accepted_v1';

export function hasAcceptedLegalConsents(): boolean {
  try {
    return localStorage.getItem(CONSENT_GIVEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAcceptedLegalConsents(accepted: boolean): void {
  try {
    if (accepted) {
      localStorage.setItem(CONSENT_GIVEN_KEY, 'true');
    } else {
      localStorage.removeItem(CONSENT_GIVEN_KEY);
    }
  } catch {
    // ignore
  }
}
