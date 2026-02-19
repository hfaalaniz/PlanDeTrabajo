import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlanTrabajo, getSavedPlansList, loadPlanById } from '@/hooks/usePlanTrabajo';
import { PlanForm } from '@/components/PlanForm';
import { TareaForm } from '@/components/TareaForm';
import { TareasList } from '@/components/TareasList';
import { Timeline } from '@/components/Timeline';
import { PlanPreview } from '@/components/PlanPreview';
import { PDFExport } from '@/components/PDFExport';
import { EmpresaForm } from '@/components/EmpresaForm';
import type { Tarea } from '@/types';
import {
  FileText,
  Plus,
  ListTodo,
  Calendar,
  Eye,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Save,
  FolderOpen,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import './App.css';

type StatFilter = 'all' | 'completada' | 'en-progreso' | 'pendiente';

function App() {
  const {
    plan,
    activeTab,
    setActiveTab,
    updatePlanInfo,
    updateEmpresaOrigen,
    updateEmpresaDestino,
    addTarea,
    updateTarea,
    deleteTarea,
    resetPlan,
    loadExamplePlan,
    savePlanManual,
    loadPlan,
  } = usePlanTrabajo();

  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showSavedConfirm, setShowSavedConfirm] = useState(false);
  const [statFilter, setStatFilter] = useState<StatFilter | null>(null);
  const [savedList] = useState(() => getSavedPlansList());

  const handleEditTarea = (tarea: Tarea) => setEditingTarea(tarea);

  const handleUpdateTarea = (updatedTarea: Omit<Tarea, 'id'>) => {
    if (editingTarea) {
      updateTarea(editingTarea.id, updatedTarea);
      setEditingTarea(null);
    }
  };

  const handleSave = () => {
    savePlanManual();
    setShowSavedConfirm(true);
    setTimeout(() => setShowSavedConfirm(false), 2500);
  };

  const handleLoadPlan = (id: string) => {
    const loaded = loadPlanById(id);
    if (loaded) {
      loadPlan(loaded);
      setShowLoadDialog(false);
    }
  };

  const handleStatCardClick = (filter: StatFilter) => {
    setStatFilter((prev) => (prev === filter ? null : filter));
    setActiveTab('editar');
  };

  const getEstadisticas = () => {
    const total = plan.tareas.length;
    const completadas = plan.tareas.filter((t) => t.estado === 'completada').length;
    const enProgreso = plan.tareas.filter((t) => t.estado === 'en-progreso').length;
    const pendientes = plan.tareas.filter((t) => t.estado === 'pendiente').length;
    return { total, completadas, enProgreso, pendientes };
  };

  const stats = getEstadisticas();

  const filteredTareas = statFilter && statFilter !== 'all'
    ? plan.tareas.filter((t) => t.estado === statFilter)
    : plan.tareas;

  const statCards = [
    {
      filter: 'all' as StatFilter,
      label: 'Total Tareas',
      value: stats.total,
      icon: <ListTodo className="w-4 h-4" />,
      color: 'text-slate-500',
      boldColor: 'text-slate-800',
      activeClass: 'ring-2 ring-slate-400',
    },
    {
      filter: 'completada' as StatFilter,
      label: 'Completadas',
      value: stats.completadas,
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-emerald-600',
      boldColor: 'text-emerald-700',
      activeClass: 'ring-2 ring-emerald-400',
    },
    {
      filter: 'en-progreso' as StatFilter,
      label: 'En Progreso',
      value: stats.enProgreso,
      icon: <Clock className="w-4 h-4" />,
      color: 'text-blue-600',
      boldColor: 'text-blue-700',
      activeClass: 'ring-2 ring-blue-400',
    },
    {
      filter: 'pendiente' as StatFilter,
      label: 'Pendientes',
      value: stats.pendientes,
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-slate-500',
      boldColor: 'text-slate-700',
      activeClass: 'ring-2 ring-slate-300',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                  Plan de Trabajo Pro
                </h1>
                <p className="text-xs text-slate-500">Crea planes profesionales con línea de tiempo</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Guardar */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="hidden sm:flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Save className="w-4 h-4" />
                {showSavedConfirm ? '¡Guardado!' : 'Guardar'}
              </Button>

              {/* Cargar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoadDialog(true)}
                className="hidden sm:flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Cargar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                className="hidden sm:flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Nuevo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadExamplePlan}
                className="hidden sm:flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Ejemplo
              </Button>
              <PDFExport plan={plan} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar — clicables */}
        {plan.tareas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <button
                key={card.filter}
                onClick={() => handleStatCardClick(card.filter)}
                className={`bg-white rounded-xl p-4 shadow-sm border text-left transition-all duration-150 hover:shadow-md ${
                  statFilter === card.filter ? `${card.activeClass} border-transparent` : 'border-slate-100'
                }`}
              >
                <div className={`flex items-center gap-2 ${card.color} mb-1`}>
                  {card.icon}
                  <span className="text-sm">{card.label}</span>
                </div>
                <p className={`text-2xl font-bold ${card.boldColor}`}>{card.value}</p>
              </button>
            ))}
          </div>
        )}

        {/* Banner filtro activo */}
        {statFilter && statFilter !== 'all' && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 text-sm">
            <span>
              Mostrando tareas: <strong>{statFilter === 'completada' ? 'Completadas' : statFilter === 'en-progreso' ? 'En Progreso' : 'Pendientes'}</strong>
              {' '}({filteredTareas.length})
            </span>
            <button onClick={() => setStatFilter(null)} className="ml-auto hover:text-indigo-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200">
            <TabsTrigger value="editar" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Plus className="w-4 h-4 mr-1" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="empresas" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-1" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-1" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="vista-previa" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-1" />
              Vista Previa
            </TabsTrigger>
          </TabsList>

          {/* Tab: Editar */}
          <TabsContent value="editar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PlanForm
                  initialData={{
                    titulo: plan.titulo,
                    descripcion: plan.descripcion,
                    autor: plan.autor,
                    fechaInicio: plan.fechaInicio,
                    fechaFin: plan.fechaFin,
                    objetivos: plan.objetivos,
                  }}
                  onSubmit={updatePlanInfo}
                />
                <TareaForm
                  onAdd={addTarea}
                  planFechaInicio={plan.fechaInicio}
                  planFechaFin={plan.fechaFin}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-indigo-600" />
                    Tareas
                    {filteredTareas.length > 0 && (
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                        {filteredTareas.length}
                      </Badge>
                    )}
                  </h2>
                  {statFilter && (
                    <button
                      onClick={() => setStatFilter(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Quitar filtro
                    </button>
                  )}
                </div>
                <TareasList
                  tareas={filteredTareas}
                  onDelete={deleteTarea}
                  onEdit={handleEditTarea}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Empresas */}
          <TabsContent value="empresas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmpresaForm
                titulo="Empresa Emisora"
                initialData={plan.empresaOrigen}
                onSubmit={updateEmpresaOrigen}
              />
              <EmpresaForm
                titulo="Empresa Destinataria"
                initialData={plan.empresaDestino}
                onSubmit={updateEmpresaDestino}
              />
            </div>
          </TabsContent>

          {/* Tab: Timeline */}
          <TabsContent value="timeline">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Línea de Tiempo del Proyecto</h2>
                <p className="text-slate-600">
                  {plan.titulo || 'Plan de Trabajo'}
                  {plan.fechaInicio && plan.fechaFin && (
                    <span className="text-slate-500">
                      {' '}({plan.fechaInicio} - {plan.fechaFin})
                    </span>
                  )}
                </p>
              </div>
              <Timeline
                tareas={plan.tareas}
                planFechaInicio={plan.fechaInicio}
                planFechaFin={plan.fechaFin}
              />
            </div>
          </TabsContent>

          {/* Tab: Vista Previa */}
          <TabsContent value="vista-previa">
            <div className="bg-slate-100 rounded-2xl p-4 md:p-8 overflow-auto">
              <PlanPreview plan={plan} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">Plan de Trabajo Pro - Crea planes profesionales fácilmente</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={loadExamplePlan}>
                <Sparkles className="w-4 h-4 mr-2" />
                Cargar Ejemplo
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialog: Editar Tarea */}
      <Dialog open={!!editingTarea} onOpenChange={() => setEditingTarea(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          {editingTarea && (
            <TareaForm
              onAdd={handleUpdateTarea}
              planFechaInicio={plan.fechaInicio}
              planFechaFin={plan.fechaFin}
              initialData={{
                titulo: editingTarea.titulo,
                descripcion: editingTarea.descripcion,
                fechaInicio: editingTarea.fechaInicio,
                fechaFin: editingTarea.fechaFin,
                responsable: editingTarea.responsable,
                estado: editingTarea.estado,
                prioridad: editingTarea.prioridad,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Reset */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              ¿Nuevo Plan de Trabajo?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              Esto eliminará todo el contenido actual y creará un nuevo plan vacío. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  resetPlan();
                  setShowResetDialog(false);
                  setStatFilter(null);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cargar Plan */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
              Cargar Plan Guardado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {savedList.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No hay planes guardados aún.</p>
            ) : (
              savedList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLoadPlan(item.id)}
                  className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                >
                  <p className="font-medium text-slate-800">{item.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(item.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;