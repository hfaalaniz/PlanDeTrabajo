import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { PlanTrabajoFormData } from '@/types';
import { FileText, Calendar, User, Target, AlignLeft } from 'lucide-react';

interface PlanFormProps {
  initialData: PlanTrabajoFormData;
  onSubmit: (data: PlanTrabajoFormData) => void;
}

export const PlanForm = ({ initialData, onSubmit }: PlanFormProps) => {
  const [formData, setFormData] = useState<PlanTrabajoFormData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof PlanTrabajoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Información General
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-slate-700 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Título del Plan
            </Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ej: Desarrollo de Proyecto Web"
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-slate-700 font-medium flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-500" />
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describe el propósito y alcance del plan..."
              rows={3}
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="autor" className="text-slate-700 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Autor / Responsable
              </Label>
              <Input
                id="autor"
                value={formData.autor}
                onChange={(e) => handleChange('autor', e.target.value)}
                placeholder="Nombre del responsable"
                className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Período del Plan
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => handleChange('fechaInicio', e.target.value)}
                  className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-slate-500">-</span>
                <Input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => handleChange('fechaFin', e.target.value)}
                  className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivos" className="text-slate-700 font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-500" />
              Objetivos
            </Label>
            <Textarea
              id="objetivos"
              value={formData.objetivos}
              onChange={(e) => handleChange('objetivos', e.target.value)}
              placeholder="Define los objetivos principales del plan..."
              rows={3}
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            Guardar Información
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
