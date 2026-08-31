-- App 模块表（物理表名依环境而定：fa_app_module 或 app_module，与模型 $name = 'app_module' 对应）
CREATE TABLE IF NOT EXISTS `app_module` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) DEFAULT NULL COMMENT '代号',
  `title` varchar(32) DEFAULT NULL COMMENT '标题',
  `ends` varchar(32) DEFAULT NULL COMMENT '开放端,分割：h5,pc,app',
  `created_at` datetime DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='App模块';

-- 若从旧表升级，可执行：
-- ALTER TABLE `app_module` DROP COLUMN `is_open`;
-- ALTER TABLE `app_module` ADD COLUMN `ends` varchar(32) DEFAULT NULL COMMENT '开放端,分割：h5,pc,app' AFTER `title`;
-- ALTER TABLE `app_module` MODIFY COLUMN `code` varchar(32) DEFAULT NULL;
-- ALTER TABLE `app_module` MODIFY COLUMN `title` varchar(32) DEFAULT NULL;

-- 菜单规则：app/module，子节点 index、add、edit、del
