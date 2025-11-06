-- Add indexes for analytics and timeline queries

-- Documents table indexes for analytics
CREATE INDEX `documents_createdAt_idx` ON `documents`(`createdAt`);
CREATE INDEX `documents_archivadorId_documentDate_idx` ON `documents`(`archivadorId`, `documentDate`);
CREATE INDEX `documents_expedienteId_documentDate_idx` ON `documents`(`expedienteId`, `documentDate`);
CREATE INDEX `documents_documentTypeId_documentDate_idx` ON `documents`(`documentTypeId`, `documentDate`);

-- Audit logs indexes for timeline queries (with prefix length to avoid key length issues)
CREATE INDEX `audit_logs_entityType_entityId_idx` ON `audit_logs`(`entityType`(100), `entityId`(100));
CREATE INDEX `audit_logs_entityType_createdAt_idx` ON `audit_logs`(`entityType`(100), `createdAt`);
