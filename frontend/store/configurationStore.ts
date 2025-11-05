import { create } from 'zustand';
import { configurationApi } from '@/lib/api/configuration';
import { SystemConfig, UpdateGeneralConfigPayload } from '@/types/configuration.types';
import { toast } from 'sonner';

type AssetType = 'logo' | 'favicon' | 'stamp' | 'loginBg1' | 'loginBg2' | 'loginBg3' | 'loginBg4' | 'loginBg5';

interface ConfigurationState {
  config: SystemConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  saveGeneral: (data: UpdateGeneralConfigPayload) => Promise<void>;
  uploadAsset: (type: AssetType, file: File) => Promise<void>;
  removeAsset: (type: AssetType) => Promise<void>;
}

export const useConfigurationStore = create<ConfigurationState>((set) => ({
  config: null,
  isLoading: false,
  error: null,

  fetchConfig: async () => {
    try {
      set({ isLoading: true, error: null });

      // Use cached config if available (avoids unnecessary API calls)
      // Only access sessionStorage on client-side
      if (typeof window !== 'undefined') {
        const cachedConfig = sessionStorage.getItem('system_config');
        if (cachedConfig) {
          set({ config: JSON.parse(cachedConfig), isLoading: false });
          // Still fetch in background to update if needed
          try {
            const response = await configurationApi.getConfig();
            const config = response.data.data;
            sessionStorage.setItem('system_config', JSON.stringify(config));
            set({ config });
          } catch (bgError) {
            // Silently fail background update - cache is good enough
            console.warn('Background config update failed:', bgError);
          }
          return;
        }
      }

      const response = await configurationApi.getConfig();
      const config = response.data.data;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('system_config', JSON.stringify(config));
      }
      set({ config, isLoading: false });
    } catch (error) {
      // Don't show error toast on login page - just use defaults
      const message = error instanceof Error ? error.message : 'Error al cargar la configuración';
      set({ error: message, isLoading: false });
      console.warn('Failed to fetch configuration, using defaults:', message);
    }
  },

  saveGeneral: async (data: UpdateGeneralConfigPayload) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await configurationApi.updateConfig(data);
      const config = response.data.data;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('system_config', JSON.stringify(config));
      }
      set({ config, isLoading: false });

      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar la configuración';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  uploadAsset: async (type: AssetType, file: File) => {
    try {
      set({ isLoading: true, error: null });

      let response;
      
      if (type === 'logo') {
        response = await configurationApi.uploadLogo(file);
      } else if (type === 'favicon') {
        response = await configurationApi.uploadFavicon(file);
      } else if (type === 'stamp') {
        response = await configurationApi.uploadStamp(file);
      } else {
        // Login background
        const slot = type.replace('loginBg', '');
        response = await configurationApi.uploadLoginBackground(file, slot);
      }

      const config = response.data.data;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('system_config', JSON.stringify(config));
      }
      set({ config, isLoading: false });

      const assetName = type === 'logo' ? 'Logo' : 
                        type === 'favicon' ? 'Favicon' :
                        type === 'stamp' ? 'Sello' :
                        `Imagen de fondo ${type.replace('loginBg', '')}`;
      toast.success(`${assetName} actualizado correctamente`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Error al subir ${type === 'logo' ? 'el logo' : 'el sello'}`;
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  removeAsset: async (type: AssetType) => {
    try {
      set({ isLoading: true, error: null });

      let response;
      
      if (type === 'logo') {
        response = await configurationApi.deleteLogo();
      } else if (type === 'favicon') {
        response = await configurationApi.deleteFavicon();
      } else if (type === 'stamp') {
        response = await configurationApi.deleteStamp();
      } else {
        // Login background
        const slot = type.replace('loginBg', '');
        response = await configurationApi.deleteLoginBackground(slot);
      }

      const config = response.data.data;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('system_config', JSON.stringify(config));
      }
      set({ config, isLoading: false });

      const assetName = type === 'logo' ? 'Logo' : 
                        type === 'favicon' ? 'Favicon' :
                        type === 'stamp' ? 'Sello' :
                        `Imagen de fondo ${type.replace('loginBg', '')}`;
      toast.success(`${assetName} eliminado correctamente`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Error al eliminar ${type === 'logo' ? 'el logo' : 'el sello'}`;
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },
}));
