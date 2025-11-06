-- CreateTable
CREATE TABLE `system_config` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL DEFAULT 'Sistema Integrado de Archivos Digitales',
    `companyTagline` VARCHAR(191) NULL,
    `companyEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `supportEmail` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `primaryColor` VARCHAR(191) NULL,
    `accentColor` VARCHAR(191) NULL,
    `logoFileName` VARCHAR(191) NULL,
    `logoFilePath` VARCHAR(191) NULL,
    `logoMimeType` VARCHAR(191) NULL,
    `logoFileSize` INTEGER NULL,
    `stampFileName` VARCHAR(191) NULL,
    `stampFilePath` VARCHAR(191) NULL,
    `stampMimeType` VARCHAR(191) NULL,
    `stampFileSize` INTEGER NULL,
    `signatureStampEnabled` BOOLEAN NOT NULL DEFAULT true,
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `system_config_updatedAt_idx`(`updatedAt`),
    INDEX `system_config_updatedBy_idx`(`updatedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `system_config` ADD CONSTRAINT `system_config_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
