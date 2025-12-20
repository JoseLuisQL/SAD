'use client';

import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

function calculateStrength(password: string): number {
  if (!password) return 0;
  
  let strength = 0;
  
  // Longitud mínima
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Contiene mayúsculas
  if (/[A-Z]/.test(password)) strength++;
  
  // Contiene números
  if (/[0-9]/.test(password)) strength++;
  
  // Contiene caracteres especiales
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  // Normalizar a escala 1-4
  return Math.min(4, Math.max(1, Math.ceil(strength * 0.8)));
}

const strengthLabels: Record<number, string> = {
  0: '',
  1: 'Contraseña débil',
  2: 'Contraseña regular',
  3: 'Contraseña buena',
  4: 'Contraseña fuerte',
};

const strengthColors: Record<number, string> = {
  0: 'bg-gray-200 dark:bg-slate-700',
  1: 'bg-red-500',
  2: 'bg-yellow-500',
  3: 'bg-blue-500',
  4: 'bg-green-500',
};

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = calculateStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2" role="status" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              level <= strength 
                ? strengthColors[strength]
                : 'bg-gray-200 dark:bg-slate-700'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
        {strengthLabels[strength]}
      </p>
    </div>
  );
}
