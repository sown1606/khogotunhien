-- CreateTable
CREATE TABLE `MusicTrack` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `youtubeUrl` VARCHAR(500) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MusicTrack_active_sortOrder_idx`(`active`, `sortOrder`),
    INDEX `MusicTrack_sortOrder_createdAt_idx`(`sortOrder`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `MusicTrack` (
    `id`,
    `title`,
    `youtubeUrl`,
    `active`,
    `sortOrder`,
    `createdAt`,
    `updatedAt`
) VALUES
    (
        'music_default_lofi_8h',
        '8 Hour Lofi Chill / Study / Relax',
        'https://www.youtube.com/watch?v=a91o81IfCRk',
        true,
        1,
        NOW(3),
        NOW(3)
    ),
    (
        'music_default_lofi_12h',
        '12 Hours Copyright Free Lofi Beats',
        'https://www.youtube.com/watch?v=3ztDYjkgdCo',
        true,
        2,
        NOW(3),
        NOW(3)
    );
