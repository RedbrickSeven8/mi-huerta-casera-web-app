import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getUser, setDonorStatus } from './authService';
import type { DonationRequest } from '../types/huerta';

const LOCAL_DONATIONS_KEY = 'huerta_casera_donation_requests';
const LOCAL_IS_DONOR_KEY = 'huerta_casera_is_donor';

export function getLocalDonorStatus(): boolean {
  return localStorage.getItem(LOCAL_IS_DONOR_KEY) === 'true';
}

export function setLocalDonorStatus(isDonor: boolean): void {
  localStorage.setItem(LOCAL_IS_DONOR_KEY, isDonor ? 'true' : 'false');
  setDonorStatus(isDonor);
}

export async function fetchUserDonorStatus(userId?: string, email?: string): Promise<boolean> {
  const user = getUser();
  const targetId = userId || user?.id;
  const targetEmail = email || user?.email;

  if (supabase && isSupabaseConfigured && (targetId || targetEmail)) {
    try {
      let query = supabase.from('profiles').select('is_donor, role');
      if (targetId && targetId !== 'demo-user-123') {
        query = query.eq('id', targetId);
      } else if (targetEmail) {
        query = query.eq('email', targetEmail);
      }
      
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        if (typeof data.is_donor === 'boolean') {
          setLocalDonorStatus(data.is_donor);
        }
        if (data.role && user && user.role !== data.role) {
          const { setUserRole } = await import('./authService');
          setUserRole(data.role as 'admin' | 'user');
        }
        return Boolean(data.is_donor);
      }
    } catch (err) {
      console.warn('Error al consultar estado de donante en Supabase:', err);
    }
  }

  // Fallback a localStorage
  const localVal = getLocalDonorStatus();
  if (user && user.isDonor !== localVal) {
    setDonorStatus(localVal);
  }
  return localVal;
}

export async function submitDonationRequest(payload: {
  receiptNumber: string;
  payerEmail: string;
  notes?: string;
  userEmail?: string;
  userName?: string;
  userId?: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = getUser();
  const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const reqItem: DonationRequest = {
    id,
    userId: payload.userId || (user?.provider === 'google' ? user.id : null),
    userEmail: payload.userEmail || user?.email || payload.payerEmail,
    userName: payload.userName || user?.name || 'Usuario',
    receiptNumber: payload.receiptNumber.trim(),
    payerEmail: payload.payerEmail.trim(),
    notes: payload.notes?.trim() || '',
    status: 'pending',
    createdAt: nowIso
  };

  // Guardar en Supabase si está disponible
  if (supabase && isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('donation_requests').insert({
        id: reqItem.id,
        user_id: reqItem.userId || null,
        user_email: reqItem.userEmail,
        user_name: reqItem.userName,
        receipt_number: reqItem.receiptNumber,
        payer_email: reqItem.payerEmail,
        notes: reqItem.notes,
        status: reqItem.status,
        created_at: reqItem.createdAt
      });

      if (error) {
        console.warn('Error al guardar solicitud de donación en Supabase, guardando localmente:', error);
      }
    } catch (err) {
      console.warn('Excepción al enviar solicitud a Supabase:', err);
    }
  }

  // Guardar siempre en historial local como respaldo
  try {
    const existing = getLocalDonationRequests();
    existing.unshift(reqItem);
    localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
  }

  return { success: true };
}

export function getLocalDonationRequests(): DonationRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_DONATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchAllDonationRequests(): Promise<DonationRequest[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          userEmail: d.user_email,
          userName: d.user_name,
          receiptNumber: d.receipt_number,
          payerEmail: d.payer_email,
          notes: d.notes,
          status: d.status as 'pending' | 'approved' | 'rejected',
          createdAt: d.created_at,
          reviewedAt: d.reviewed_at
        }));
      }
    } catch (err) {
      console.warn('Error consultando donation_requests en Supabase:', err);
    }
  }

  return getLocalDonationRequests();
}

export async function updateDonationRequestStatus(
  requestId: string,
  newStatus: 'approved' | 'rejected',
  targetEmail: string,
  targetUserId?: string | null
): Promise<boolean> {
  const isApproved = newStatus === 'approved';
  const nowIso = new Date().toISOString();

  if (supabase && isSupabaseConfigured) {
    try {
      await supabase
        .from('donation_requests')
        .update({ status: newStatus, reviewed_at: nowIso })
        .eq('id', requestId);

      if (isApproved) {
        if (targetUserId) {
          await supabase.from('profiles').update({ is_donor: true }).eq('id', targetUserId);
        } else if (targetEmail) {
          await supabase.from('profiles').update({ is_donor: true }).eq('email', targetEmail);
        }
      }
    } catch (err) {
      console.warn('Error actualizando estado en Supabase:', err);
    }
  }

  // Actualizar en localStorage si coincide con el usuario actual
  const currentUser = getUser();
  if (isApproved && currentUser && (currentUser.email === targetEmail || currentUser.id === targetUserId)) {
    setLocalDonorStatus(true);
  }

  // Actualizar lista local
  const localList = getLocalDonationRequests().map((item) =>
    item.id === requestId ? { ...item, status: newStatus, reviewedAt: nowIso } : item
  );
  localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(localList));

  return true;
}
