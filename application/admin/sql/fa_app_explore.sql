-- 探索位表（物理表名依环境而定：fa_app_explore 或 app_explore）

CREATE TABLE IF NOT EXISTS `app_explore` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(64) DEFAULT NULL COMMENT '标题',
  `image` varchar(255) DEFAULT NULL COMMENT '图片',
  `digest` varchar(128) DEFAULT NULL COMMENT '描述',
  `url` varchar(255) DEFAULT NULL COMMENT '链接',
  `position` varchar(16) DEFAULT NULL COMMENT '位置',
  `ends` varchar(32) DEFAULT NULL COMMENT '开放端,分割：h5,pc,app',
  `sort` int(11) DEFAULT '0' COMMENT '排序，越大越靠前',
  `updated_at` datetime DEFAULT NULL COMMENT '更新时间',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='探索位';

-- 若从旧表升级，可执行：
-- ALTER TABLE `app_explore` DROP COLUMN `is_open`;
-- ALTER TABLE `app_explore` ADD COLUMN `ends` varchar(32) DEFAULT NULL COMMENT '开放端,分割：h5,pc,app' AFTER `position`;
-- ALTER TABLE `app_explore` MODIFY COLUMN `title` varchar(64) DEFAULT NULL;
