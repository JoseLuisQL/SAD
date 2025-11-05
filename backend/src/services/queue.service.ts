import { v4 as uuidv4 } from 'uuid';

interface QueueItem {
  id: string;
  documentId: string;
  retries: number;
}

class QueueService {
  private queue: QueueItem[] = [];
  private processing = false;
  private maxRetries = 3;

  async addToQueue(documentId: string): Promise<void> {
    this.queue.push({
      id: uuidv4(),
      documentId,
      retries: 0
    });

    console.log(`[QUEUE] Documento ${documentId} agregado a la cola. Total en cola: ${this.queue.length}`);
    
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const item = this.queue.shift()!;

    try {
      console.log(`[QUEUE] Procesando documento ${item.documentId}...`);
      
      const { processDocument } = await import('./ocr.service');
      await processDocument(item.documentId);
      
      console.log(`[QUEUE] Documento ${item.documentId} procesado exitosamente`);
    } catch (error) {
      console.error(`[QUEUE] Error procesando documento ${item.documentId}:`, error);
      
      if (item.retries < this.maxRetries) {
        item.retries++;
        this.queue.push(item);
        console.log(`[QUEUE] Documento ${item.documentId} re-agregado a la cola. Intento ${item.retries}/${this.maxRetries}`);
      } else {
        console.error(`[QUEUE] Documento ${item.documentId} excedió el máximo de reintentos`);
      }
    } finally {
      this.processing = false;
      
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  isProcessing(): boolean {
    return this.processing;
  }
}

export const queueService = new QueueService();

export default {
  addToQueue: (documentId: string) => queueService.addToQueue(documentId),
  getQueueSize: () => queueService.getQueueSize(),
  isProcessing: () => queueService.isProcessing()
};
