import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Coffee,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Mail,
  FileText,
  User,
  RefreshCw,
  Sparkles,
  Search
} from 'lucide-react';
import { fetchAllDonationRequests, updateDonationRequestStatus, setLocalDonorStatus } from '../services/donationService';
import type { DonationRequest, PageRoute } from '../types/huerta';
import type { UserProfile } from '../services/authService';

interface AdminDonationsPageProps {
  onNavigate: (route: PageRoute) => void;
  user: UserProfile | null;
}

export const AdminDonationsPage: React.FC<AdminDonationsPageProps> = ({ onNavigate, user }) => {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllDonationRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (req: DonationRequest) => {
    await updateDonationRequestStatus(req.id, 'approved', req.userEmail, req.userId);
    setActionMsg(`Insignia de donante activada para ${req.userEmail}`);
    await loadData();
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleReject = async (req: DonationRequest) => {
    await updateDonationRequestStatus(req.id, 'rejected', req.userEmail, req.userId);
    setActionMsg(`Solicitud rechazada para ${req.userEmail}`);
    await loadData();
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleToggleCurrentSelfDonor = () => {
    if (!user) return;
    const nextState = !user.isDonor;
    setLocalDonorStatus(nextState);
    setActionMsg(`Insignia ${nextState ? 'activada' : 'desactivada'} para la sesión actual (${user.email})`);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.payerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFD7] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Panel de Gestión y Validación de Comprobantes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E] flex items-center gap-2">
            <span>Validación de Donaciones</span>
            <Coffee className="w-6 h-6 text-amber-600" />
          </h1>
          <p className="text-sm text-[#4A554E] mt-1">
            Revisa los números de comprobante de Mercado Pago y activa la insignia de café en los perfiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('inicio')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F2EFE9] text-xs font-semibold text-[#1A231E] hover:bg-[#E2DFD7] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            title="Refrescar lista"
            className="p-2 rounded-xl bg-white border border-[#E2DFD7] text-[#4A554E] hover:text-[#1A231E] hover:bg-[#FAF9F6] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Banner de feedback */}
      {actionMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </motion.div>
      )}

      {/* Panel rápido de prueba / activación para el usuario actual */}
      {user && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#1A231E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Estado de Donante para tu sesión ({user.email}):</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.isDonor
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.isDonor ? 'Insignia Activa' : 'Insignia Inactiva'}
              </span>
            </p>
            <p className="text-[11px] text-[#5A655E]">
              Puedes probar la apariencia de la insignia de café en tus avatares inmediatamente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleCurrentSelfDonor}
            className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-semibold hover:bg-[#23471E] transition-colors cursor-pointer shrink-0"
          >
            {user.isDonor ? 'Desactivar mi insignia' : 'Activar mi insignia ahora'}
          </button>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por comprobante, correo o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#D5E0D3] bg-white text-xs text-[#1A231E] focus:outline-none focus:border-[#2D5A27]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#2D5A27] text-white'
                  : 'bg-[#F2EFE9] text-[#4A554E] hover:bg-[#E2DFD7]'
              }`}
            >
              {st === 'all' ? 'Todos' : st === 'pending' ? 'Pendientes' : st === 'approved' ? 'Aprobados' : 'Rechazados'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de solicitudes */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF9F6] rounded-3xl border border-[#E2DFD7] space-y-3">
          <Coffee className="w-10 h-10 mx-auto text-[#8A968E]" />
          <h3 className="text-sm font-bold text-[#1A231E]">
            No hay solicitudes de insignia registradas
          </h3>
          <p className="text-xs text-[#5A655E] max-w-md mx-auto">
            Cuando los usuarios apoyen en Mercado Pago y pulsen «Ya doné / Solicitar mi insignia de Donante», aparecerán aquí para su validación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-[#E2DFD7] bg-white shadow-xs hover:border-[#D5E0D3] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {isApproved ? 'Insignia Activada' : isRejected ? 'Rechazado' : 'Pendiente de Validación'}
                    </span>
                    <span className="text-[11px] text-[#5A655E]">
                      {new Date(req.createdAt).toLocaleString('es-CO')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#1A231E]">
                      <FileText className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                      <span className="font-semibold">Comprobante:</span>
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                        {req.receiptNumber || 'No especificado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#1A231E]">
                      <Mail className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                      <span className="font-semibold">Correo Pagador:</span>
                      <span>{req.payerEmail}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#5A655E]">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Usuario App:</span>
                      <span className="text-[#1A231E] font-medium">
                        {req.userName} ({req.userEmail})
                      </span>
                    </div>

                    {req.notes && (
                      <div className="sm:col-span-2 text-[11px] text-[#5A655E] bg-[#FAF9F6] p-2 rounded-lg border border-[#E2DFD7]">
                        <span className="font-semibold text-[#1A231E]">Nota del usuario:</span>{' '}
                        {req.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2DFD7] shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(req)}
                    disabled={isApproved}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isApproved
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#2D5A27] text-white hover:bg-[#23471E]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isApproved ? 'Aprobado' : 'Validar y Activar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(req)}
                    disabled={isRejected}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isRejected
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#F2EFE9] text-[#A32A2A] hover:bg-red-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
