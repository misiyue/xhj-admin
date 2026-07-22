-- App 模块开关表（物理表名：fa_app_module，与模型 $name = 'app_module' 对应）
CREATE TABLE IF NOT EXISTS `fa_app_module` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL COMMENT '代号',
  `title` varchar(255) DEFAULT NULL COMMENT '标题',
  `is_open` tinyint(4) DEFAULT NULL COMMENT '是否开放：0-否，1-是',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='App模块开关';

-- 菜单规则：app/module
-- 子节点：index、add、edit、del、multi
