import React, { useState } from 'react';
import { ShieldCheck, Download, PlusCircle } from 'lucide-react';
import { getAuditLogs } from '../services/auditLogger';
import type { PageRoute } from '../types/huerta';

interface AuditLogPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ onNavigate }) => {
  const [logs] = useState(() => getAuditLogs());

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'registro-auditoria-consentimientos.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DFD7] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A27] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Responsable del tratamiento: las paginas de dani</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A231E]">
            Registro Técnico de Auditoría de Consentimientos
          </h1>
          <p className="text-sm text-[#4A554E] mt-1">
            Trazabilidad inmutable de fecha, hora exacta, documento legal y método de aceptación de cada consentimiento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2EFE9] text-[#1A231E] text-xs font-semibold hover:bg-[#E2DFD7]"
            >
              <Download className="w-4 h-4" />
              <span>Exportar JSON</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs font-semibold hover:bg-[#23471E]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-[#1A231E]">
            Aún no se han registrado eventos de consentimiento en esta sesión.
          </p>
          <p className="text-xs text-[#5A655E] max-w-md mx-auto">
            Al aceptar o configurar el aviso de cookies o al enviar el formulario de alta de cultivo con sus casillas independientes, se generará el asiento técnico con fecha, hora y método.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('registro')}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D5A27] text-[#FAF9F6] text-xs font-semibold"
          >
            Ir al Formulario de Alta
          </button>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F2EFE9] text-[#1A231E] border-b border-[#E2DFD7]">
                  <th className="py-3.5 px-4 font-semibold">ID Auditoría</th>
                  <th className="py-3.5 px-4 font-semibold">Fecha</th>
                  <th className="py-3.5 px-4 font-semibold">Hora</th>
                  <th className="py-3.5 px-4 font-semibold">Tipo de Consentimiento</th>
                  <th className="py-3.5 px-4 font-semibold">Estado</th>
                  <th className="py-3.5 px-4 font-semibold">Método de Aceptación</th>
                  <th className="py-3.5 px-4 font-semibold">Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DFD7]">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F6]">
                    <td className="py-3 px-4 font-mono font-semibold text-[#2D5A27]">{item.id}</td>
                    <td className="py-3 px-4 text-[#1A231E]">{item.date}</td>
                    <td className="py-3 px-4 font-mono text-[#1A231E]">{item.time}</td>
                    <td className="py-3 px-4 font-medium text-[#1A231E]">{item.consentType}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] font-semibold">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4A554E] max-w-xs">{item.acceptanceMethod}</td>
                    <td className="py-3 px-4 text-[#5A655E]">{item.formOrigin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
