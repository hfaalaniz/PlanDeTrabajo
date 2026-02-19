import { useRef, useState, useCallback } from 'react';
import type { PlanTrabajo } from '@/types';
import { Button } from '@/components/ui/button';
import { PlanPreview } from './PlanPreview';
import { Timeline } from './Timeline';
import {
  FileDown, Loader2, Printer, Download,
  CheckCircle2, XCircle, AlertTriangle, Info,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Tipos y estilos para alertas personalizadas ──────────────────────────────
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  open: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ALERT_DEFAULTS: AlertState = { open: false, type: 'info', title: '', message: '' };

const ALERT_CFG: Record<AlertType, { icon: React.ReactNode; header: string; btn: string }> = {
  success: { icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />, header: 'bg-emerald-50 border-emerald-200', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  error:   { icon: <XCircle      className="w-6 h-6 text-red-500"     />, header: 'bg-red-50 border-red-200',         btn: 'bg-red-600 hover:bg-red-700'         },
  warning: { icon: <AlertTriangle className="w-6 h-6 text-amber-500"  />, header: 'bg-amber-50 border-amber-200',     btn: 'bg-amber-600 hover:bg-amber-700'     },
  info:    { icon: <Info          className="w-6 h-6 text-indigo-500" />, header: 'bg-indigo-50 border-indigo-200',   btn: 'bg-indigo-600 hover:bg-indigo-700'   },
};

const CustomAlert = ({ state, onClose }: { state: AlertState; onClose: () => void }) => {
  const c = ALERT_CFG[state.type];
  return (
    <Dialog open={state.open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${c.header}`}>
          {c.icon}
          <DialogTitle className="text-base font-semibold text-slate-800 m-0">{state.title}</DialogTitle>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600 leading-relaxed">{state.message}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-4">
          {state.onConfirm && (
            <Button variant="outline" size="sm" onClick={onClose}>
              {state.cancelLabel ?? 'Cancelar'}
            </Button>
          )}
          <Button size="sm" className={`text-white ${c.btn}`} onClick={() => { state.onConfirm?.(); onClose(); }}>
            {state.confirmLabel ?? 'Aceptar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Helper: espera N ms ──────────────────────────────────────────────────────
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Captura un elemento visible en el DOM ────────────────────────────────────
const captureVisible = async (el: HTMLElement): Promise<HTMLCanvasElement> => {
  // Forzar reflow antes de capturar
  el.getBoundingClientRect();
  await wait(150);

  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    // Capturar exactamente el elemento completo ignorando scroll
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
  });
};

// ─── Agrega un canvas al PDF con paginación ───────────────────────────────────
const addCanvasToPDF = (pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPage: boolean) => {
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const scaledH = (canvas.height * pdfW) / canvas.width;

  if (!isFirstPage) pdf.addPage();

  if (scaledH <= pdfH) {
    pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdfW, scaledH);
    return;
  }

  // Paginación por cortes de canvas
  const px2mm    = pdfW / canvas.width;
  const pageHpx  = Math.floor(pdfH / px2mm);
  let srcY = 0, page = 0;

  while (srcY < canvas.height && page < 50) {
    if (page > 0) pdf.addPage();
    const sliceH = Math.min(pageHpx, canvas.height - srcY);
    const pg = document.createElement('canvas');
    pg.width  = canvas.width;
    pg.height = sliceH;
    const ctx = pg.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pg.width, pg.height);
    ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    pdf.addImage(pg.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdfW, sliceH * px2mm);
    srcY += pageHpx;
    page++;
  }
};

// ─── Componente principal ─────────────────────────────────────────────────────
interface PDFExportProps {
  plan: PlanTrabajo;
}

export const PDFExport = ({ plan }: PDFExportProps) => {
  // Refs a los elementos VISIBLES dentro de las tabs del dialog
  const visiblePlanRef     = useRef<HTMLDivElement>(null);
  const visibleTimelineRef = useRef<HTMLDivElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen]                 = useState(false);
  const [activeTab, setActiveTab]       = useState('preview');
  const [includeTL, setIncludeTL]       = useState(true);
  const [alert, setAlert]               = useState<AlertState>(ALERT_DEFAULTS);

  const showAlert = useCallback((type: AlertType, title: string, message: string) => {
    setAlert({ open: true, type, title, message });
  }, []);

  const closeAlert = useCallback(() => setAlert(ALERT_DEFAULTS), []);

  // ─── Genera el PDF cambiando tabs para que los elementos estén visibles ──
  const generatePDF = useCallback(async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // --- Capturar Plan: asegurar que la tab "preview" esté activa ---
      setActiveTab('preview');
      await wait(400); // esperar que Radix muestre el contenido

      const planEl = visiblePlanRef.current;
      if (!planEl) throw new Error('No se encontró el elemento del plan');

      const planCanvas = await captureVisible(planEl);
      addCanvasToPDF(pdf, planCanvas, true);

      // --- Capturar Timeline si está habilitado ---
      if (includeTL) {
        setActiveTab('timeline');
        await wait(400);

        const tlEl = visibleTimelineRef.current;
        if (tlEl) {
          const tlCanvas = await captureVisible(tlEl);
          addCanvasToPDF(pdf, tlCanvas, false);
        }
      }

      // Restaurar tab original
      setActiveTab('options');
      await wait(100);
      setActiveTab('preview');

      const fileName = `${(plan.titulo || 'plan-de-trabajo').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);

      showAlert('success', 'PDF descargado', `El archivo "${fileName}" se descargó correctamente.`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      showAlert('error', 'Error al generar PDF', 'No se pudo crear el archivo PDF. Verifica que el plan tenga contenido e intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  }, [plan.titulo, includeTL, showAlert]);

  // ─── Imprimir ─────────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    const planEl = visiblePlanRef.current;
    if (!planEl) return;

    // Si la tab plan no está activa, cambiarla primero
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      setTimeout(handlePrint, 300);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showAlert('warning', 'Ventana bloqueada', 'El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este sitio e intenta nuevamente.');
      return;
    }

    const planContent = planEl.outerHTML;
    const tlEl = visibleTimelineRef.current;
    const tlContent = includeTL && tlEl ? tlEl.outerHTML : '';

    printWindow.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${plan.titulo || 'Plan de Trabajo'}</title>
  <style>
    @page{size:A4;margin:12mm}
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:10pt;line-height:1.4;color:#1e293b;background:#fff;margin:0;padding:0}
    .print-page{width:100%;margin:0 auto}
    .page-break{page-break-before:always;padding-top:1rem}
    .bg-white{background:#fff!important}.bg-indigo-600{background:#4f46e5!important}
    .bg-slate-50{background:#f8fafc!important}.bg-slate-100{background:#f1f5f9!important}
    .bg-emerald-50{background:#f0fdf4!important}.bg-amber-50{background:#fffbeb!important}
    .bg-red-50{background:#fef2f2!important}.bg-blue-50{background:#eff6ff!important}
    .bg-indigo-50{background:#eef2ff!important}
    .text-white{color:#fff!important}.text-slate-800{color:#1e293b!important}
    .text-slate-700{color:#334155!important}.text-slate-600{color:#475569!important}
    .text-slate-500{color:#64748b!important}.text-slate-400{color:#94a3b8!important}
    .text-indigo-600{color:#4f46e5!important}.text-indigo-700{color:#4338ca!important}
    .text-emerald-500{color:#10b981!important}.text-emerald-600{color:#059669!important}
    .text-blue-500{color:#3b82f6!important}.text-blue-600{color:#2563eb!important}
    .text-amber-600{color:#d97706!important}.text-red-600{color:#dc2626!important}
    .border{border:1px solid #e2e8f0!important}.border-0{border:none!important}
    .border-4{border-width:4px!important}.border-white{border-color:#fff!important}
    .border-slate-100{border-color:#f1f5f9!important}
    .rounded-xl{border-radius:.75rem!important}.rounded-full{border-radius:9999px!important}
    .rounded-lg{border-radius:.5rem!important}.rounded-md{border-radius:.375rem!important}
    .shadow-md,.shadow-lg,.shadow-sm{box-shadow:0 1px 3px rgba(0,0,0,.1)!important}
    .flex{display:flex!important}.inline-flex{display:inline-flex!important}
    .flex-1{flex:1 1 0%!important}.flex-wrap{flex-wrap:wrap!important}
    .flex-col{flex-direction:column!important}.flex-shrink-0{flex-shrink:0!important}
    .items-start{align-items:flex-start!important}.items-center{align-items:center!important}
    .justify-between{justify-content:space-between!important}
    .gap-1{gap:.25rem!important}.gap-2{gap:.5rem!important}.gap-3{gap:.75rem!important}
    .gap-4{gap:1rem!important}.gap-8{gap:2rem!important}
    .space-y-6>*+*{margin-top:1.5rem!important}
    .p-4{padding:1rem!important}.p-8{padding:2rem!important}
    .px-2{padding-left:.5rem!important;padding-right:.5rem!important}
    .py-1{padding-top:.25rem!important;padding-bottom:.25rem!important}
    .mb-1{margin-bottom:.25rem!important}.mb-2{margin-bottom:.5rem!important}
    .mb-3{margin-bottom:.75rem!important}.mb-6{margin-bottom:1.5rem!important}
    .ml-14{margin-left:3.5rem!important}.mt-8{margin-top:2rem!important}
    .font-bold{font-weight:700!important}.font-semibold{font-weight:600!important}.font-medium{font-weight:500!important}
    .text-xs{font-size:.75rem!important}.text-sm{font-size:.875rem!important}
    .text-lg{font-size:1.125rem!important}.text-2xl{font-size:1.5rem!important}
    .text-center{text-align:center!important}.italic{font-style:italic!important}
    .min-w-0{min-width:0!important}.relative{position:relative!important}.absolute{position:absolute!important}
    .w-3{width:.75rem!important}.h-3{height:.75rem!important}
    .w-4{width:1rem!important}.h-4{height:1rem!important}
    .w-5{width:1.25rem!important}.h-5{height:1.25rem!important}
    .w-8{width:2rem!important}.h-8{height:2rem!important}
    .w-10{width:2.5rem!important}.h-10{height:2.5rem!important}
    .top-0{top:0!important}.bottom-0{bottom:0!important}.left-4{left:1rem!important}
    .z-10{z-index:10!important}.hidden{display:none!important}
    .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    @media print{body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
  </style>
</head>
<body>
  <div class="print-page">${planContent}</div>
  ${tlContent ? `<div class="print-page page-break"><h2 style="font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;text-align:center">Línea de Tiempo</h2>${tlContent}</div>` : ''}
  <script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close()},800)},500)}</script>
</body>
</html>`);
    printWindow.document.close();
  }, [plan.titulo, includeTL, activeTab, showAlert]);

  const hasContent = !!(plan.titulo || plan.tareas.length > 0);

  return (
    <>
      <CustomAlert state={alert} onClose={closeAlert} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!hasContent}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </DialogTrigger>

        <DialogContent
          className="p-0 flex flex-col"
          style={{ maxWidth: '90vw', width: '1100px', height: '90vh', maxHeight: '90vh' }}
        >
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileDown className="w-5 h-5 text-indigo-600" />
              Exportar Plan de Trabajo
            </DialogTitle>
          </DialogHeader>

          {/* Indicador de progreso mientras genera */}
          {isGenerating && (
            <div className="mx-6 mt-3 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg flex items-center gap-3 flex-shrink-0 text-sm">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              Generando PDF... por favor espera, las pestañas cambiarán automáticamente.
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="px-6 py-3 border-b bg-slate-50 flex-shrink-0">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="preview"  disabled={isGenerating}>Plan</TabsTrigger>
                <TabsTrigger value="timeline" disabled={isGenerating}>Timeline</TabsTrigger>
                <TabsTrigger value="options"  disabled={isGenerating}>Opciones</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab: Plan — ref aquí para captura */}
            <TabsContent value="preview" className="m-0 flex-1 overflow-auto">
              <div className="bg-slate-100 min-h-full p-6">
                <div ref={visiblePlanRef}>
                  <PlanPreview plan={plan} />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Timeline — ref aquí para captura */}
            <TabsContent value="timeline" className="m-0 flex-1 overflow-auto">
              <div className="bg-white min-h-full p-6">
                <div
                  ref={visibleTimelineRef}
                  className="bg-white p-8 mx-auto"
                  style={{ maxWidth: '794px' }}
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                    Línea de Tiempo
                  </h2>
                  <Timeline
                    tareas={plan.tareas}
                    planFechaInicio={plan.fechaInicio}
                    planFechaFin={plan.fechaFin}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Opciones */}
            <TabsContent value="options" className="m-0 flex-1 overflow-auto">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">Opciones de Exportación</h3>
                  <p className="text-slate-600 text-sm">Configura qué incluir y cómo exportar.</p>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
                  <input
                    type="checkbox"
                    id="include-timeline"
                    checked={includeTL}
                    onChange={e => setIncludeTL(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <label htmlFor="include-timeline" className="text-slate-700 font-medium cursor-pointer">
                    Incluir Línea de Tiempo en el PDF
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Download className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Descargar PDF</h4>
                        <p className="text-sm text-slate-500">Guardar como archivo PDF</p>
                      </div>
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700" disabled={isGenerating} onClick={generatePDF}>
                      {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generando...</> : <><Download className="w-4 h-4 mr-2" />Descargar</>}
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Printer className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Imprimir</h4>
                        <p className="text-sm text-slate-500">Enviar a impresora / Guardar PDF</p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isGenerating} onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />Imprimir
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">Consejos</h4>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>Activa "Incluir Línea de Tiempo" para tener todo en un solo PDF</li>
                    <li>Para mejor calidad usa "Descargar PDF"</li>
                    <li>Al imprimir, selecciona "Guardar como PDF" en el diálogo</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>Cerrar</Button>
            <Button variant="outline" onClick={handlePrint} disabled={isGenerating}>
              <Printer className="w-4 h-4 mr-2" />Imprimir
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={generatePDF} disabled={isGenerating}>
              {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generando...</> : <><Download className="w-4 h-4 mr-2" />Descargar PDF</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};