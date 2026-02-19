import { forwardRef } from 'react';
import type { PlanTrabajo } from '@/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  User,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flag,
  AlignLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Hash,
} from 'lucide-react';

interface PlanPreviewProps {
  plan: PlanTrabajo;
}

// Valores compactos centralizados
const S = {
  page:        { width: '210mm', minHeight: '297mm', maxWidth: '100%', margin: '0 auto', padding: '1.5rem 2rem', backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', fontSize: '10pt', lineHeight: '1.4', color: '#1e293b' },
  headerWrap:  { borderBottom: '2px solid #4f46e5', paddingBottom: '0.75rem', marginBottom: '0.75rem' },
  headerRow:   { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' },
  icon:        { width: '2.25rem', height: '2.25rem', backgroundColor: '#4f46e5', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  h1:          { fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  subtitle:    { color: '#64748b', fontSize: '0.75rem', margin: 0 },
  metaRow:     { display: 'flex', flexWrap: 'wrap' as const, gap: '0.75rem' },
  metaItem:    { display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155', fontSize: '0.8rem' },
  section:     { marginBottom: '0.85rem' },
  sectionHead: { fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  sectionText: { color: '#334155', lineHeight: '1.5', fontSize: '0.82rem', margin: 0 },
  empresaWrap: { marginBottom: '0.85rem', padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '0.4rem', border: '1px solid #e2e8f0' },
  empresaGrid: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const },
  empresaBlock:{ flex: 1, minWidth: '180px' },
  empresaLabel:{ fontWeight: '600', fontSize: '0.65rem', textTransform: 'uppercase' as const, color: '#4f46e5', marginBottom: '0.3rem', letterSpacing: '0.05em' },
  empresaNom:  { fontWeight: '700', color: '#0f172a', fontSize: '0.85rem', marginBottom: '0.15rem' },
  empresaRow:  { color: '#475569', fontSize: '0.75rem', marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  divider:     { width: '1px', backgroundColor: '#e2e8f0', alignSelf: 'stretch' as const },
  tareasList:  { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  tareaCard:   { border: '1px solid #e2e8f0', borderRadius: '0.4rem', padding: '0.6rem 0.75rem' },
  tareaInner:  { display: 'flex', alignItems: 'flex-start', gap: '0.6rem' },
  tareaNum:    { flexShrink: 0, width: '1.5rem', height: '1.5rem', backgroundColor: '#e0e7ff', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', fontWeight: '600', fontSize: '0.7rem' },
  tareaBody:   { flex: 1, minWidth: 0 },
  tareaTopRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' as const },
  tareaTitulo: { fontWeight: '600', color: '#1e293b', margin: 0, fontSize: '0.85rem' },
  tareaDesc:   { color: '#475569', fontSize: '0.78rem', marginBottom: '0.4rem', lineHeight: '1.4' },
  tareaMetaRow:{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#475569' },
  badge:       (bg: string, color: string, border: string) => ({ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.68rem', fontWeight: '500', border: `1px solid ${border}`, backgroundColor: bg, color }),
  footer:      { marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' as const, color: '#94a3b8', fontSize: '0.72rem' },
  ico:         (size = '0.8rem') => ({ width: size, height: size, display: 'inline' as const }),
};

export const PlanPreview = forwardRef<HTMLDivElement, PlanPreviewProps>(
  ({ plan }, ref) => {

    const formatDate = (d: string) => {
      if (!d) return '-';
      try { return format(parseISO(d), 'dd MMM yyyy', { locale: es }); }
      catch { return d; }
    };

    const estadoIcon = (estado: string) => {
      if (estado === 'completada') return <CheckCircle2 style={S.ico()} />;
      if (estado === 'en-progreso') return <Clock style={S.ico()} />;
      return <AlertCircle style={S.ico()} />;
    };

    const estadoLabel = (e: string) =>
      e === 'completada' ? 'Completada' : e === 'en-progreso' ? 'En Progreso' : 'Pendiente';

    const prioridadBadgeStyle = (p: string) =>
      p === 'alta'  ? S.badge('#fee2e2','#b91c1c','#fecaca') :
      p === 'media' ? S.badge('#fef3c7','#b45309','#fde68a') :
                      S.badge('#d1fae5','#047857','#a7f3d0');

    const sorted = [...plan.tareas].sort(
      (a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    );

    const hasOrigen  = !!plan.empresaOrigen?.nombre;
    const hasDestino = !!plan.empresaDestino?.nombre;

    const renderEmpresa = (titulo: string, emp: typeof plan.empresaOrigen) => (
      <div style={S.empresaBlock}>
        <p style={S.empresaLabel}>{titulo}</p>
        {emp.nombre    && <p style={S.empresaNom}>{emp.nombre}</p>}
        {emp.rut       && <p style={S.empresaRow}><Hash style={S.ico('0.7rem')} />{emp.rut}</p>}
        {emp.direccion && <p style={S.empresaRow}><MapPin style={S.ico('0.7rem')} />{emp.direccion}</p>}
        {emp.telefono  && <p style={S.empresaRow}><Phone style={S.ico('0.7rem')} />{emp.telefono}</p>}
        {emp.email     && <p style={S.empresaRow}><Mail style={S.ico('0.7rem')} />{emp.email}</p>}
        {emp.contacto  && <p style={S.empresaRow}><User style={S.ico('0.7rem')} />{emp.contacto}</p>}
      </div>
    );

    return (
      <div ref={ref} id="plan-preview-content" style={S.page}>

        {/* ── Header ── */}
        <div style={S.headerWrap}>
          <div style={S.headerRow}>
            <div style={S.icon}>
              <FileText style={{ width: '1.2rem', height: '1.2rem', color: 'white' }} />
            </div>
            <div>
              <h1 style={S.h1}>{plan.titulo || 'Plan de Trabajo'}</h1>
              <p style={S.subtitle}>Creado el {formatDate(plan.fechaCreacion)}</p>
            </div>
          </div>
          <div style={S.metaRow}>
            {plan.autor && (
              <span style={S.metaItem}>
                <User style={S.ico()} />{plan.autor}
              </span>
            )}
            {(plan.fechaInicio || plan.fechaFin) && (
              <span style={S.metaItem}>
                <Calendar style={S.ico()} />
                {formatDate(plan.fechaInicio)}{plan.fechaFin && ` – ${formatDate(plan.fechaFin)}`}
              </span>
            )}
            <span style={S.metaItem}>
              <FileText style={S.ico()} />
              {plan.tareas.length} {plan.tareas.length === 1 ? 'tarea' : 'tareas'}
            </span>
          </div>
        </div>

        {/* ── Empresas ── */}
        {(hasOrigen || hasDestino) && (
          <div style={S.empresaWrap}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Building2 style={S.ico()} />
              <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b' }}>Partes Involucradas</span>
            </div>
            <div style={S.empresaGrid}>
              {hasOrigen  && renderEmpresa('Empresa Emisora',       plan.empresaOrigen)}
              {hasOrigen && hasDestino && <div style={S.divider} />}
              {hasDestino && renderEmpresa('Empresa Destinataria',  plan.empresaDestino)}
            </div>
          </div>
        )}

        {/* ── Descripción ── */}
        {plan.descripcion && (
          <div style={S.section}>
            <h2 style={S.sectionHead}>
              <AlignLeft style={S.ico()} />Descripción
            </h2>
            <p style={S.sectionText}>{plan.descripcion}</p>
          </div>
        )}

        {/* ── Objetivos ── */}
        {plan.objetivos && (
          <div style={S.section}>
            <h2 style={S.sectionHead}>
              <Target style={S.ico()} />Objetivos
            </h2>
            <p style={S.sectionText}>{plan.objetivos}</p>
          </div>
        )}

        {/* ── Tareas ── */}
        <div style={S.section}>
          <h2 style={S.sectionHead}>
            <CheckCircle2 style={S.ico()} />Plan de Acción
          </h2>

          {sorted.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.82rem' }}>No hay tareas definidas</p>
          ) : (
            <div style={S.tareasList}>
              {sorted.map((t, i) => (
                <div key={t.id} style={S.tareaCard}>
                  <div style={S.tareaInner}>
                    <div style={S.tareaNum}>{i + 1}</div>
                    <div style={S.tareaBody}>
                      <div style={S.tareaTopRow}>
                        <h3 style={S.tareaTitulo}>{t.titulo}</h3>
                        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                          <span style={prioridadBadgeStyle(t.prioridad)}>
                            <Flag style={S.ico('0.65rem')} />{t.prioridad}
                          </span>
                          <span style={S.badge('#f1f5f9','#334155','#e2e8f0')}>
                            {estadoIcon(t.estado)}{estadoLabel(t.estado)}
                          </span>
                        </div>
                      </div>
                      {t.descripcion && <p style={S.tareaDesc}>{t.descripcion}</p>}
                      <div style={S.tareaMetaRow}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Calendar style={S.ico('0.75rem')} />
                          {formatDate(t.fechaInicio)} – {formatDate(t.fechaFin)}
                        </span>
                        {t.responsable && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <User style={S.ico('0.75rem')} />{t.responsable}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={S.footer}>
          <p>Plan de Trabajo generado con Plan de Trabajo Pro</p>
        </div>
      </div>
    );
  }
);

PlanPreview.displayName = 'PlanPreview';