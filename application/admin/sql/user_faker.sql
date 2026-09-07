-- 假人管理表结构
CREATE TABLE IF NOT EXISTS `user_faker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='假人管理';

-- 菜单权限规则（对应规则 user/faker）
-- 可使用命令行快速自动生成：
-- php think menu -c user/faker
--
-- 或者直接执行以下 SQL（若表前缀为 fa_ 请自行替换）：
-- 获取父级 user 的 id
-- SET @user_pid = (SELECT `id` FROM `fa_auth_rule` WHERE `name` = 'user' LIMIT 1);
-- INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `status`, `weigh`)
-- VALUES ('file', IFNULL(@user_pid, 0), 'user/faker', '假人管理', 'fa fa-user-secret', 1, 'normal', 0);
-- SET @faker_pid = LAST_INSERT_ID();
-- INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `status`, `weigh`) VALUES
-- ('file', @faker_pid, 'user/faker/index', '查看', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @faker_pid, 'user/faker/add', '添加', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @faker_pid, 'user/faker/edit', '编辑', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @faker_pid, 'user/faker/del', '删除', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @faker_pid, 'user/faker/multi', '批量更新', 'fa fa-circle-o', 0, 'normal', 0);
