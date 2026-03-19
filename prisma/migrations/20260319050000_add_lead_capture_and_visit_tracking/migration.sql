-- AlterTable
ALTER TABLE `SiteSetting`
  ADD COLUMN `leadPopupEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `leadPopupDelaySeconds` INTEGER NOT NULL DEFAULT 25,
  ADD COLUMN `leadPopupTitle` VARCHAR(191) NULL DEFAULT 'Cần hỗ trợ nhanh?',
  ADD COLUMN `leadPopupTitleEn` VARCHAR(191) NULL,
  ADD COLUMN `leadPopupDescription` TEXT NULL,
  ADD COLUMN `leadPopupDescriptionEn` TEXT NULL;

-- CreateTable
CREATE TABLE `LeadCapture` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `sourcePath` VARCHAR(191) NULL,
    `locale` VARCHAR(191) NULL DEFAULT 'vi',
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LeadCapture_createdAt_idx`(`createdAt` DESC),
    INDEX `LeadCapture_status_createdAt_idx`(`status`, `createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VisitLog` (
    `id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NULL DEFAULT 'vi',
    `referrer` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VisitLog_path_createdAt_idx`(`path`, `createdAt` DESC),
    INDEX `VisitLog_createdAt_idx`(`createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
