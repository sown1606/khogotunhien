-- Add nullable product merchandising fields used by public cards and admin editing.
ALTER TABLE `Product`
    ADD COLUMN `price` INTEGER NULL,
    ADD COLUMN `comparePrice` INTEGER NULL,
    ADD COLUMN `discountPercent` INTEGER NULL,
    ADD COLUMN `shippingLabel` VARCHAR(191) NULL,
    ADD COLUMN `badgeLabel` VARCHAR(80) NULL,
    ADD COLUMN `tags` JSON NULL,
    ADD COLUMN `rating` DOUBLE NULL,
    ADD COLUMN `reviewCount` INTEGER NULL;
