-- Add editable homepage hero image settings.
ALTER TABLE `SiteSetting`
  ADD COLUMN `heroMainImageUrl` VARCHAR(500) NULL,
  ADD COLUMN `heroDetailImageUrl` VARCHAR(500) NULL;

UPDATE `SiteSetting`
SET
  `heroMainImageUrl` = COALESCE(`heroMainImageUrl`, '/demo/hero/wood-hero-main.jpg'),
  `heroDetailImageUrl` = COALESCE(`heroDetailImageUrl`, '/demo/hero/wood-hero-side-1.jpg')
WHERE `id` = 'default';

-- Ensure the homepage has an editable wood project gallery.
SET @project_section_id := (
  SELECT `id`
  FROM `HomepageSection`
  WHERE
    `slug` IN ('cong-trinh', 'cong-trinh-su-dung-go', 'wood-project-gallery', 'wood-projects')
    OR `title` LIKE '%Công Trình%'
    OR `title` LIKE '%Công trình%'
    OR `title` LIKE '%công trình%'
  ORDER BY `sortOrder` ASC, `createdAt` ASC
  LIMIT 1
);

SET @project_section_id := COALESCE(@project_section_id, 'homepage_wood_project_gallery');

INSERT INTO `HomepageSection` (
  `id`,
  `title`,
  `titleEn`,
  `slug`,
  `description`,
  `descriptionEn`,
  `type`,
  `visible`,
  `sortOrder`,
  `createdAt`,
  `updatedAt`
)
SELECT
  @project_section_id,
  'Công trình sử dụng gỗ',
  'Wood Project Gallery',
  'wood-project-gallery',
  'Hình ảnh công trình, góc nội thất và hạng mục thực tế có sử dụng gỗ từ xưởng.',
  'Completed project images, interior details, and real wood applications from the workshop.',
  'CUSTOM',
  true,
  3,
  NOW(3),
  NOW(3)
WHERE NOT EXISTS (
  SELECT 1
  FROM `HomepageSection`
  WHERE `id` = @project_section_id
);

UPDATE `HomepageSection`
SET
  `description` = COALESCE(
    NULLIF(`description`, ''),
    'Hình ảnh công trình, góc nội thất và hạng mục thực tế có sử dụng gỗ từ xưởng.'
  ),
  `descriptionEn` = COALESCE(
    NULLIF(`descriptionEn`, ''),
    'Completed project images, interior details, and real wood applications from the workshop.'
  ),
  `visible` = true,
  `updatedAt` = NOW(3)
WHERE `id` = @project_section_id;

SET @project_item_count := (
  SELECT COUNT(*)
  FROM `HomepageSectionItem`
  WHERE `sectionId` = @project_section_id
);

INSERT INTO `HomepageSectionItem` (
  `id`,
  `sectionId`,
  `customTitle`,
  `customTitleEn`,
  `customDescription`,
  `customDescriptionEn`,
  `imageUrl`,
  `linkUrl`,
  `active`,
  `sortOrder`,
  `createdAt`,
  `updatedAt`
)
SELECT
  'homepage_wood_project_item_1',
  @project_section_id,
  'Không gian bàn gỗ tự nhiên',
  'Solid Wood Table Setting',
  'Ảnh thực tế các hạng mục bàn, mặt gỗ và chi tiết hoàn thiện cho khách tham khảo.',
  'Real project references for tables, wood surfaces, and finishing details.',
  '/demo/products/product-014.webp',
  '/categories/wood-slabs',
  true,
  1,
  NOW(3),
  NOW(3)
WHERE @project_item_count = 0;

INSERT INTO `HomepageSectionItem` (
  `id`,
  `sectionId`,
  `customTitle`,
  `customTitleEn`,
  `customDescription`,
  `customDescriptionEn`,
  `imageUrl`,
  `linkUrl`,
  `active`,
  `sortOrder`,
  `createdAt`,
  `updatedAt`
)
SELECT
  'homepage_wood_project_item_2',
  @project_section_id,
  'Ốp gỗ và panel nội thất',
  'Interior Wood Panels',
  'Các mảng tường, vách và panel trang trí ứng dụng gỗ trong không gian thực tế.',
  'Wall, partition, and decorative panel applications in real interiors.',
  '/demo/products/product-019.webp',
  '/categories/decorative-wood-panels',
  true,
  2,
  NOW(3),
  NOW(3)
WHERE @project_item_count = 0;

INSERT INTO `HomepageSectionItem` (
  `id`,
  `sectionId`,
  `customTitle`,
  `customTitleEn`,
  `customDescription`,
  `customDescriptionEn`,
  `imageUrl`,
  `linkUrl`,
  `active`,
  `sortOrder`,
  `createdAt`,
  `updatedAt`
)
SELECT
  'homepage_wood_project_item_3',
  @project_section_id,
  'Gỗ cho bếp và quầy',
  'Wood for Kitchens and Counters',
  'Mặt bếp, quầy bar và các chi tiết gỗ được gia công theo kích thước công trình.',
  'Kitchen tops, counters, and custom wood details made to project dimensions.',
  '/demo/products/product-022.webp',
  '/categories/interior-wood-materials',
  true,
  3,
  NOW(3),
  NOW(3)
WHERE @project_item_count = 0;
