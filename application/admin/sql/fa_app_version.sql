-- APP 版本表（默认数据库表前缀为 fa_，若 prefix 为空请去掉 fa_ 前缀）
-- 与 application/admin/model/AppVersion.php 中 $name = 'app_version' 对应物理表名：fa_app_version

CREATE TABLE IF NOT EXISTS `fa_app_version` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `platform` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '平台：ios/android',
  `channel` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '渠道：enterprise/appstore/xxx',
  `latest_version_name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '最新版本号',
  `upgrade_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'optional' COMMENT '升级类型：optional/force',
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '发现新版本',
  `release_notes` json DEFAULT NULL COMMENT '发布说明（JSON数组）',
  `download_urls` json DEFAULT NULL COMMENT '下载链接（JSON数组）',
  `published_at` datetime NOT NULL COMMENT '发布时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_platform_channel` (`platform`,`channel`),
  KEY `idx_version` (`latest_version_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='APP版本表';

-- 菜单与权限节点 name 须为 app/version、app/version/index 等；建议在后台「权限管理 → 菜单规则」中新增，
-- 或使用一键生成菜单功能，避免 fa_auth_rule.name 重复。
