'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ShieldAlert, User, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/constants';
import AuthHelper from './AuthHelper';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Ingrese su nombre de usuario')
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z
    .string()
    .min(1, 'Ingrese su contraseña')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const securityStatus = useAuthStore((state) => state.securityStatus);
  const fetchSecurityStatus = useAuthStore((state) => state.fetchSecurityStatus);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRemember = localStorage.getItem('remember_me') === 'true';
      setRememberMe(savedRemember);
      
      if (savedRemember) {
        const savedUsername = localStorage.getItem('saved_username');
        if (savedUsername) {
          setValue('username', savedUsername);
        }
      }
    }
  }, [setValue]);

  useEffect(() => {
    if (securityStatus?.lockedUntil) {
      const lockedUntilTime = new Date(securityStatus.lockedUntil).getTime();
      const updateCountdown = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((lockedUntilTime - now) / 1000));
        setCountdown(remaining);
        
        if (remaining === 0) {
          fetchSecurityStatus();
        }
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    } else {
      setCountdown(0);
    }
  }, [securityStatus, fetchSecurityStatus]);

  const onSubmit = async (data: LoginFormData) => {
    if (securityStatus?.isLocked) {
      toast.warning(
        `Cuenta bloqueada temporalmente. Por favor espera ${Math.ceil(countdown / 60)} minutos.`,
        { duration: 5000 }
      );
      return;
    }

    setIsLoading(true);
    try {
      await login(data);
      
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('saved_username', data.username);
        } else {
          localStorage.removeItem('remember_me');
          localStorage.removeItem('saved_username');
        }
      }
      
      toast.success('¡Bienvenido!', {
        description: 'Redirigiendo al sistema...',
        duration: 2000,
      });
      router.push(ROUTES.DASHBOARD);
    } catch (error: any) {
      // Handle account locked error
      if (error?.code === 'ACCOUNT_LOCKED') {
        const minutes = error?.minutesRemaining || 30;
        toast.error('Cuenta Bloqueada Temporalmente', {
          description: error.message || `Su cuenta ha sido bloqueada por seguridad. Intente nuevamente en ${minutes} minutos.`,
          duration: 8000,
        });
      }
      // Handle invalid credentials with remaining attempts warning
      else if (error?.code === 'INVALID_CREDENTIALS') {
        const remaining = error?.remainingAttempts;
        if (remaining !== undefined && remaining > 0) {
          toast.error('Credenciales Incorrectas', {
            description: `Usuario o contraseña incorrectos. Le quedan ${remaining} intento${remaining !== 1 ? 's' : ''} antes de que su cuenta sea bloqueada.`,
            duration: 6000,
          });
        } else {
          toast.error('Credenciales Incorrectas', {
            description: error.message || 'Usuario o contraseña incorrectos.',
            duration: 5000,
          });
        }
      }
      // Generic error
      else {
        const errorMessage = error instanceof Error ? error.message : 'Verifica tus credenciales e intenta nuevamente';
        toast.error('No se pudo iniciar sesión', {
          description: errorMessage,
          duration: 4000,
        });
      }
      
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
      await fetchSecurityStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked && typeof window !== 'undefined') {
      localStorage.removeItem('remember_me');
      localStorage.removeItem('saved_username');
    }
  };

  const isLocked = securityStatus?.isLocked || false;
  const minutesRemaining = Math.ceil(countdown / 60);
  const secondsRemaining = countdown % 60;

  return (
    <form 
      id="login-form"
      onSubmit={handleSubmit(onSubmit)} 
      className={`space-y-5 ${hasError ? 'animate-shake' : ''}`}
      role="form"
      aria-label="Formulario de inicio de sesión"
    >
      {/* Live region para lectores de pantalla */}
      <div role="status" aria-live="polite" className="sr-only">
        {errors.username && `Error en usuario: ${errors.username.message}`}
        {errors.password && `Error en contraseña: ${errors.password.message}`}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="username" 
          className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
        >
          <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          Usuario
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Ingrese su nombre de usuario"
          autoComplete="username"
          autoFocus
          disabled={isLoading || isLocked}
          aria-describedby={errors.username ? "username-error" : "username-help"}
          aria-invalid={!!errors.username}
          {...register('username')}
          className="h-12 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-lg"
        />
        <p id="username-help" className="sr-only">
          Ingrese su nombre de usuario del sistema
        </p>
        {errors.username && (
          <p 
            id="username-error"
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1" 
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-3 w-3" />
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="password" 
          className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
        >
          <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingrese su contraseña"
            autoComplete="current-password"
            disabled={isLoading || isLocked}
            aria-describedby={errors.password ? "password-error" : "password-help"}
            aria-invalid={!!errors.password}
            {...register('password')}
            className="h-12 pr-12 border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-lg"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-md transition-colors"
            disabled={isLoading || isLocked}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p id="password-help" className="sr-only">
          Ingrese su contraseña. Debe tener al menos 8 caracteres
        </p>
        {errors.password && (
          <p 
            id="password-error"
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-3 w-3" />
            {errors.password.message}
          </p>
        )}
      </div>

      {isLocked && countdown > 0 && (
        <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-900 dark:text-red-200">
            <strong className="font-semibold">Cuenta bloqueada temporalmente</strong>
            <p className="mt-1 text-sm">
              Por seguridad, tu cuenta ha sido bloqueada debido a múltiples intentos fallidos.
            </p>
            <p className="mt-2 font-mono text-lg font-bold">
              Tiempo restante: {minutesRemaining}:{secondsRemaining.toString().padStart(2, '0')}
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:shadow-none" 
          disabled={isLoading || isLocked}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando...
            </span>
          ) : isLocked ? (
            <span className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Cuenta Bloqueada
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={handleRememberMeChange}
          disabled={isLoading || isLocked}
          className="h-4 w-4 border-gray-300 dark:border-slate-600"
          aria-label="Recordar mi usuario"
        />
        <Label
          htmlFor="remember-me"
          className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none"
        >
          Recordar mi usuario
        </Label>
      </div>

      <AuthHelper />
    </form>
  );
}
