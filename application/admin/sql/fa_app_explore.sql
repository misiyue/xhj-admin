-- 探索位表（默认表前缀 fa_ → fa_app_explore；无前缀时请改为 app_explore）

CREATE TABLE IF NOT EXISTS `fa_app_explore` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(16) DEFAULT NULL COMMENT '标题',
  `image` varchar(255) DEFAULT NULL COMMENT '图片',
  `url` varchar(255) DEFAULT NULL COMMENT '链接',
  `is_open` tinyint(4) DEFAULT NULL COMMENT '是否开放：1-是，2-否',
  `position` varchar(16) DEFAULT NULL COMMENT '位置：indexTop-首页顶部，indexTMid-首页中部，idxBanner-首页轮播，tab-导航，game-小游戏',
  `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序，越大越靠前',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='探索位';

-- 已有表可执行（按需调整表名前缀）：
-- ALTER TABLE `fa_app_explore` MODIFY `title` varchar(16) DEFAULT NULL COMMENT '标题';
-- ALTER TABLE `fa_app_explore` ADD COLUMN `position` varchar(16) DEFAULT NULL COMMENT '位置' AFTER `is_open`;
-- ALTER TABLE `fa_app_explore` ADD COLUMN `sort` int(11) NOT NULL DEFAULT '0' COMMENT '排序，越大越靠前' AFTER `position`;
-- 若曾使用 position=index，可批量迁移：UPDATE fa_app_explore SET position='indexTop' WHERE position='index';
