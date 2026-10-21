import type { ConsentAuditRecord } from '../types/huerta';

const AUDIT_STORAGE_KEY = 'mi_huerta_casera_consent_audit_v1';

export function getAuditLogs(): ConsentAuditRecord[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordConsentEvent(params: {
  consentType: ConsentAuditRecord['consentType'];
  status: ConsentAuditRecord['status'];
  acceptanceMethod: string;
  formOrigin: string;
  userIdentifier?: string;
}): ConsentAuditRecord {
  const now = new Date();
  const record: ConsentAuditRecord = {
    id: 'AUD-' + now.getTime().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    date: now.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isoTimestamp: now.toISOString(),
    consentType: params.consentType,
    status: params.status,
    acceptanceMethod: params.acceptanceMethod,
    formOrigin: params.formOrigin,
    userIdentifier: params.userIdentifier || 'Usuario local'
  };

  const existing = getAuditLogs();
  const updated = [record, ...existing];
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage overflow
  }
  return record;
}

export function clearAuditLogs(): void {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
}
