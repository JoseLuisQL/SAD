'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/lib/api/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  FileText, 
  FolderOpen, 
  PenTool,
  Lock,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: any;
  };
  _count: {
    documents: number;
    archivadores: number;
    signatures: number;
  };
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getProfile();
      setProfile(response.data.data);
      setFormData({
        firstName: response.data.data.firstName,
        lastName: response.data.data.lastName,
        email: response.data.data.email
      });
    } catch (error) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al cargar perfil';
      toast.error(errorMessage || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await usersApi.updateProfile(formData);
      setProfile(prev => prev ? { ...prev, ...response.data.data } : null);
      
      if (user) {
        setUser({
          ...user,
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          email: response.data.data.email
        });
      }

      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al actualizar perfil';
      toast.error(errorMessage || 'Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">No se pudo cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-[1920px]">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Mi Perfil</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-slate-900 dark:text-white">Información Personal</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Tu información básica de cuenta</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm" className="border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving} className="border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-600 dark:text-slate-400 font-medium">Nombre</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Ingresa tu nombre"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                      <User className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">{profile.firstName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-600 dark:text-slate-400 font-medium">Apellido</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Ingresa tu apellido"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                      <User className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">{profile.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-600 dark:text-slate-400 font-medium">Correo Electrónico</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ingresa tu correo electrónico"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">{profile.email}</span>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-200 dark:bg-slate-700" />

              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400 font-medium">Nombre de Usuario</Label>
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.username}</span>
                  <Badge variant="outline" className="ml-auto border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400">No editable</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">El nombre de usuario no puede ser modificado</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 dark:text-slate-400 font-medium">Rol</Label>
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                  <Shield className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.role.name}</span>
                  <Badge variant="outline" className="ml-auto border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400">No editable</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">El rol es asignado por un administrador</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Seguridad</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">Contraseña</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Cambia tu contraseña regularmente para mayor seguridad
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setPasswordDialogOpen(true)} variant="outline" className="border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
                    Cambiar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Actividad</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Resumen de tu actividad en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Documentos</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-0 font-semibold">{profile._count.documents}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Archivadores</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-0 font-semibold">{profile._count.archivadores}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900">
                <div className="flex items-center gap-3">
                  <PenTool className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Firmas</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-0 font-semibold">{profile._count.signatures}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Información de Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Miembro desde</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {format(new Date(profile.createdAt), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Última actualización</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {format(new Date(profile.updatedAt), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${profile.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}
