-- Additive bilingual content fields for Vietnamese-first and English fallback support.
ALTER TABLE `Category`
  ADD COLUMN `nameEn` VARCHAR(191) NULL,
  ADD COLUMN `shortDescriptionEn` VARCHAR(191) NULL;

ALTER TABLE `Product`
  ADD COLUMN `nameEn` VARCHAR(191) NULL,
  ADD COLUMN `shortDescriptionEn` VARCHAR(191) NULL,
  ADD COLUMN `descriptionEn` LONGTEXT NULL,
  ADD COLUMN `woodTypeEn` VARCHAR(191) NULL,
  ADD COLUMN `materialEn` VARCHAR(191) NULL,
  ADD COLUMN `dimensionsEn` VARCHAR(191) NULL,
  ADD COLUMN `finishEn` VARCHAR(191) NULL;

ALTER TABLE `HomepageSection`
  ADD COLUMN `titleEn` VARCHAR(191) NULL,
  ADD COLUMN `descriptionEn` VARCHAR(191) NULL;

ALTER TABLE `HomepageSectionItem`
  ADD COLUMN `customTitleEn` VARCHAR(191) NULL,
  ADD COLUMN `customDescriptionEn` VARCHAR(191) NULL;

ALTER TABLE `SiteSetting`
  ADD COLUMN `companyDescriptionEn` LONGTEXT NULL,
  ADD COLUMN `addressEn` VARCHAR(191) NULL,
  ADD COLUMN `seoTitleEn` VARCHAR(191) NULL,
  ADD COLUMN `seoDescriptionEn` VARCHAR(191) NULL,
  ADD COLUMN `footerContentEn` LONGTEXT NULL,
  ADD COLUMN `openingHoursEn` VARCHAR(191) NULL,
  ADD COLUMN `contactPrimaryLabelEn` VARCHAR(191) NULL,
  ADD COLUMN `contactSecondaryLabelEn` VARCHAR(191) NULL;
