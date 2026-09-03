-- 通知文章表
CREATE TABLE IF NOT EXISTS `notice_article` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) DEFAULT NULL COMMENT '唯一编码',
  `title` varchar(64) DEFAULT NULL COMMENT '标题',
  `content` text COMMENT '内容',
  `text_type` tinyint(4) DEFAULT '1' COMMENT '文本类型：1-富文本，2-纯文本',
  `status` tinyint(4) DEFAULT NULL COMMENT '状态：0-关闭，1-开启',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_idx` (`code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知文章';

-- 已有表升级：
-- ALTER TABLE `notice_article` ADD COLUMN `text_type` tinyint(4) DEFAULT '1' COMMENT '文本类型：1-富文本，2-纯文本' AFTER `content`;
