-- 火箭资讯表（物理表名：fa_app_news / app_news）
CREATE TABLE IF NOT EXISTS `fa_app_news` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '标题',
  `category_id` int(11) NOT NULL DEFAULT '0' COMMENT '资讯分类id',
  `type_id` tinyint(4) DEFAULT NULL COMMENT '类型：1-图文，2-视频',
  `content` mediumtext COLLATE utf8mb4_unicode_ci COMMENT '正文内容',
  `cover` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '封面图',
  `source_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '原文链接',
  `upload_time` datetime DEFAULT NULL COMMENT '上传/采集时间',
  `publish_time` datetime DEFAULT NULL COMMENT '发布时间',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '状态：0-草稿，1-已发布，-1-已下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_time` (`publish_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='火箭资讯';

-- 菜单规则：content/news
-- 子节点：index、add、edit、del、multi
