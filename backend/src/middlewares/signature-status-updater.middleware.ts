import { Request, Response, NextFunction } from 'express';
import * as signatureStatusService from '../services/signature-status.service';

export const updateSignatureStatusAfterSign = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (data.documentId || req.body?.documentId || req.params?.documentId) {
        const documentId = data.documentId || req.body?.documentId || req.params?.documentId;
        
        signatureStatusService.updateDocumentSignatureStatus(documentId, req)
          .catch(error => {
            console.error('Error updating signature status:', error);
          });
      }

      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((result: any) => {
          if (result.documentId) {
            signatureStatusService.updateDocumentSignatureStatus(result.documentId, req)
              .catch(error => {
                console.error('Error updating signature status for document:', result.documentId, error);
              });
          }
        });
      }
    }

    return originalJson(data);
  };

  next();
};

export const updateSignatureStatusAfterRevert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (data.documentId || req.body?.documentId || req.params?.documentId) {
        const documentId = data.documentId || req.body?.documentId || req.params?.documentId;
        
        signatureStatusService.updateDocumentSignatureStatus(documentId, req)
          .catch(error => {
            console.error('Error updating signature status after revert:', error);
          });
      }
    }

    return originalJson(data);
  };

  next();
};

export const updateSignatureStatusAfterFlowAdvance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (data.flow && data.flow.documentId) {
        signatureStatusService.updateDocumentSignatureStatus(data.flow.documentId, req)
          .catch(error => {
            console.error('Error updating signature status after flow advance:', error);
          });
      }

      if (data.documentId || req.body?.documentId || req.params?.documentId) {
        const documentId = data.documentId || req.body?.documentId || req.params?.documentId;
        
        signatureStatusService.updateDocumentSignatureStatus(documentId, req)
          .catch(error => {
            console.error('Error updating signature status:', error);
          });
      }
    }

    return originalJson(data);
  };

  next();
};

export default {
  updateSignatureStatusAfterSign,
  updateSignatureStatusAfterRevert,
  updateSignatureStatusAfterFlowAdvance
};
