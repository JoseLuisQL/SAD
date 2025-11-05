'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
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
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
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
      
      toast.success('¡Bienvenido al sistema!', {
        description: 'Inicio de sesión exitoso'
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
        const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión. Por favor, intente nuevamente.';
        toast.error('Error de Autenticación', {
          description: errorMessage,
          duration: 5000,
        });
      }
      
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
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6"
      role="form"
      aria-label="Formulario de inicio de sesión"
    >
      <div className="space-y-3">
        <Label 
          htmlFor="username" 
          className="text-sm font-semibold text-gray-900 dark:text-white"
        >
          Usuario
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Ingrese su usuario"
          disabled={isLoading || isLocked}
          aria-describedby="username-help"
          aria-invalid={!!errors.username}
          {...register('username')}
          className="h-11 border-gray-300 dark:border-slate-700 focus:border-gray-900 dark:focus:border-slate-400 focus:ring-gray-900 dark:focus:ring-slate-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500"
        />
        <p id="username-help" className="sr-only">
          Ingrese su nombre de usuario del sistema
        </p>
        {errors.username && (
          <p 
            className="text-sm text-red-600 dark:text-red-400 font-semibold" 
            role="alert"
            aria-live="assertive"
          >
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label 
          htmlFor="password" 
          className="text-sm font-semibold text-gray-900 dark:text-white"
        >
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ingrese su contraseña"
            disabled={isLoading || isLocked}
            aria-describedby="password-help"
            aria-invalid={!!errors.password}
            {...register('password')}
            className="h-11 pr-11 border-gray-300 dark:border-slate-700 focus:border-gray-900 dark:focus:border-slate-400 focus:ring-gray-900 dark:focus:ring-slate-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
            disabled={isLoading || isLocked}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p id="password-help" className="sr-only">
          Ingrese su contraseña. Debe tener al menos 8 caracteres
        </p>
        {errors.password && (
          <p 
            className="text-sm text-red-600 dark:text-red-400 font-semibold"
            role="alert"
            aria-live="assertive"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={handleRememberMeChange}
          disabled={isLoading || isLocked}
          aria-label="Recordar mi sesión"
        />
        <Label
          htmlFor="remember-me"
          className="text-sm font-medium text-gray-800 dark:text-slate-200 cursor-pointer select-none"
        >
          Recordar mi sesión
        </Label>
      </div>

      {isLocked && countdown > 0 && (
        <Alert variant="destructive" className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-900 dark:text-red-200">
            <strong className="font-bold">Cuenta bloqueada temporalmente</strong>
            <p className="mt-1 text-sm font-medium">
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
          className="w-full h-11 text-base font-medium" 
          disabled={isLoading || isLocked}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : isLocked ? (
            'Cuenta Bloqueada'
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </div>

      <AuthHelper />
    </form>
  );
}
