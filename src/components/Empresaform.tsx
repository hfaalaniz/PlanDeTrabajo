import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Empresa } from '@/types';
import { Building2, Phone, Mail, MapPin, Hash, User, Save } from 'lucide-react';

interface EmpresaFormProps {
  titulo: string;
  icon?: React.ReactNode;
  initialData: Empresa;
  onSubmit: (data: Empresa) => void;
}

const emptyEmpresa: Empresa = {
  nombre: '',
  rut: '',
  direccion: '',
  telefono: '',
  email: '',
  contacto: '',
};

export const EmpresaForm = ({ titulo, icon, initialData, onSubmit }: EmpresaFormProps) => {
  const [formData, setFormData] = useState<Empresa>(initialData ?? emptyEmpresa);

  useEffect(() => {
    setFormData(initialData ?? emptyEmpresa);
  }, [initialData]);

  const handleChange = (field: keyof Empresa, value: string) => {
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
          {icon ?? <Building2 className="w-5 h-5 text-indigo-600" />}
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                Nombre / Razón Social
              </Label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Empresa S.A."
                className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                RUT / ID Fiscal
              </Label>
              <Input
                value={formData.rut}
                onChange={(e) => handleChange('rut', e.target.value)}
                placeholder="76.123.456-7"
                className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Dirección
            </Label>
            <Input
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Av. Principal 1234, Ciudad"
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                Teléfono
              </Label>
              <Input
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+56 9 1234 5678"
                className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@empresa.com"
                className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Persona de Contacto
            </Label>
            <Input
              value={formData.contacto}
              onChange={(e) => handleChange('contacto', e.target.value)}
              placeholder="Nombre del contacto principal"
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Datos
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};