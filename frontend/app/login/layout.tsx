import { LoginBackgroundCarousel } from '@/components/auth/LoginBackgroundCarousel';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background Carousel */}
      <LoginBackgroundCarousel />
      
      {/* Content Overlay */}
      <div className="relative z-10">
      <div className="w-full px-8 lg:px-12 xl:px-16 py-8 min-h-screen">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 xl:gap-24 items-center min-h-[calc(100vh-4rem)] w-full">
          
          {/* Sección lateral izquierda - visible solo en desktop */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 pr-4 lg:pr-8 xl:pr-12">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-white drop-shadow-2xl leading-tight">
                Sistema Integrado de<br />Archivos Digitales
              </h2>
              <p className="text-xl text-white/95 drop-shadow-lg leading-relaxed max-w-xl">
                Plataforma de gestión documental para la DISA CHINCHEROS, 
                con digitalización OCR, firma electrónica y control de versiones.
              </p>
            </div>
            
            <div className="space-y-5 pt-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-base text-white drop-shadow-lg font-semibold">Acceso seguro con autenticación robusta</p>
                  <p className="text-sm text-white/90 drop-shadow-md mt-1 font-medium">Protección de credenciales y sesiones encriptadas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-base text-white drop-shadow-lg font-semibold">Cumplimiento de estándares de confidencialidad</p>
                  <p className="text-sm text-white/90 drop-shadow-md mt-1 font-medium">Información protegida bajo normativas institucionales</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-base text-white drop-shadow-lg font-semibold">Trazabilidad completa de operaciones</p>
                  <p className="text-sm text-white/90 drop-shadow-md mt-1 font-medium">Registro detallado de todas las acciones del sistema</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenedor del formulario - derecha */}
          <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            {children}
          </div>
          
        </div>
      </div>
      </div>
    </div>
  );
}
