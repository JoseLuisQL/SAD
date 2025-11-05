import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, FileSignature } from 'lucide-react';

interface SignatureStatusBadgeProps {
  status?: 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED' | 'IN_FLOW';
  className?: string;
  showIcon?: boolean;
}

export function SignatureStatusBadge({ 
  status = 'UNSIGNED', 
  className = '',
  showIcon = true 
}: SignatureStatusBadgeProps) {
  const configs = {
    UNSIGNED: {
      label: 'Sin Firmar',
      variant: 'secondary' as const,
      icon: FileSignature,
      className: 'bg-gray-100 text-gray-700 border-gray-300'
    },
    SIGNED: {
      label: 'Firmado',
      variant: 'default' as const,
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 border-green-300'
    },
    PARTIALLY_SIGNED: {
      label: 'Parcialmente Firmado',
      variant: 'default' as const,
      icon: AlertCircle,
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    },
    REVERTED: {
      label: 'Revertido',
      variant: 'destructive' as const,
      icon: XCircle,
      className: 'bg-red-100 text-red-700 border-red-300'
    },
    IN_FLOW: {
      label: 'En Flujo de Firma',
      variant: 'default' as const,
      icon: AlertCircle,
      className: 'bg-blue-100 text-blue-700 border-blue-300'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className} flex items-center gap-1`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{config.label}</span>
    </Badge>
  );
}
