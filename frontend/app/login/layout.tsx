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
      
      {/* Skip link para accesibilidad */}
      <a 
        href="#login-form" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded-md focus:shadow-lg"
      >
        Ir al formulario de inicio de sesión
      </a>
      
      {/* Content Overlay */}
      <div className="relative z-10">
      <div className="w-full px-6 lg:px-12 xl:px-16 py-8 min-h-screen">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16 xl:gap-20 items-center min-h-[calc(100vh-4rem)] w-full">
          
          {/* Sección lateral izquierda - simplificada y minimalista */}
          <div className="hidden lg:flex flex-col justify-center space-y-6 pr-4 lg:pr-8 xl:pr-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white drop-shadow-2xl leading-tight">
                Sistema Integrado de<br />Archivos Digitales
              </h2>
              <p className="text-lg text-white/90 drop-shadow-lg leading-relaxed max-w-md">
                Gestión documental segura y eficiente
              </p>
            </div>
            
            {/* Solo 2 características clave con iconos más grandes */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-base text-white font-medium drop-shadow-lg">Acceso seguro y encriptado</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-base text-white font-medium drop-shadow-lg">Trazabilidad completa</span>
              </div>
            </div>
          </div>

          {/* Contenedor del formulario - derecha */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {children}
          </div>
          
        </div>
      </div>
      </div>
    </div>
  );
}
