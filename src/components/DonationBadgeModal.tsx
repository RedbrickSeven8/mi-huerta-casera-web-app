import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, X, CheckCircle2, AlertCircle, Heart, FileText, Mail, Send, Sparkles } from 'lucide-react';
import { submitDonationRequest } from '../services/donationService';
import type { UserProfile } from '../services/authService';

interface DonationBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSuccess?: () => void;
}

export const DonationBadgeModal: React.FC<DonationBadgeModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [payerEmail, setPayerEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!receiptNumber.trim() && !payerEmail.trim()) {
      setErrorMsg('Ingresa el número de comprobante o el correo con el que pagaste en Mercado Pago.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitDonationRequest({
        receiptNumber: receiptNumber.trim(),
        payerEmail: payerEmail.trim(),
        notes: notes.trim(),
        userEmail: user?.email,
        userName: user?.name,
        userId: user?.id
      });

      if (res.success) {
        setSubmittedSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Ocurrió un error al enviar la solicitud.');
      }
    } catch {
      setErrorMsg('No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedSuccess(false);
    setErrorMsg(null);
    setReceiptNumber('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-[#E2DFD7] p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Coffee className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A231E] flex items-center gap-1.5">
                  Solicitar Insignia de Donante
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-[#5A655E]">
                  Verificación de aporte en Mercado Pago
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submittedSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#1A231E]">
                  ¡Solicitud enviada con éxito!
                </h4>
                <p className="text-xs text-[#5A655E] max-w-sm mx-auto leading-relaxed">
                  Revisaremos tu comprobante de Mercado Pago y activaremos la insignia de café en tu avatar en los próximos minutos.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E] transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950 mb-0.5">
                    ¡Gracias por apoyar el autocultivo libre!
                  </p>
                  <p>
                    Ingresa el número de comprobante o el correo electrónico con el que realizaste el pago en Mercado Pago para validar tu insignia.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1A231E] mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Número de comprobante / Operación de Mercado Pago</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234567890 o MP-987654"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-xs text-[#1A231E] focus:outline-none focus:border-[#2D5A27] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A231E] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Correo pagador en Mercado Pago</span>
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2.5 text-xs text-[#1A231E] focus:outline-none focus:border-[#2D5A27] focus:bg-white"
                />
                <p className="text-[10px] text-[#5A655E] mt-1">
                  El correo que ingresaste al pagar o el asociado a tu cuenta de Mercado Pago.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A231E] mb-1.5">
                  Notas o comentarios adicionales (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Aporte realizado el día de hoy mediante PSE / Nequi / Tarjeta"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#D5E0D3] bg-[#FAF9F6] px-3.5 py-2 text-xs text-[#1A231E] focus:outline-none focus:border-[#2D5A27] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2DFD7]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Enviando...' : 'Enviar Comprobante'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
