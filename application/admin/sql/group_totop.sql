-- 群置顶推广位
CREATE TABLE IF NOT EXISTS `group_totop` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL COMMENT '名称',
  `cover` varchar(255) DEFAULT NULL COMMENT '封面',
  `intro` varchar(255) DEFAULT NULL COMMENT '介绍',
  `btn` varchar(255) DEFAULT NULL COMMENT '按钮文案',
  `url` varchar(255) DEFAULT NULL COMMENT '链接',
  `group_ids` varchar(255) DEFAULT NULL COMMENT '投放群id，","分隔',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='群置顶推广位';

-- 菜单权限（规则 group/totop）
-- 推荐命令：php think menu -c group/totop
--
-- 或手动插入（表前缀 fa_ 请按实际替换）：
-- SET @group_pid = (SELECT `id` FROM `fa_auth_rule` WHERE `name` = 'group' LIMIT 1);
-- INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `status`, `weigh`)
-- VALUES ('file', IFNULL(@group_pid, 0), 'group/totop', '群置顶推广', 'fa fa-thumb-tack', 1, 'normal', 0);
-- SET @totop_pid = LAST_INSERT_ID();
-- INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `status`, `weigh`) VALUES
-- ('file', @totop_pid, 'group/totop/index', '查看', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @totop_pid, 'group/totop/add', '添加', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @totop_pid, 'group/totop/edit', '编辑', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @totop_pid, 'group/totop/del', '删除', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @totop_pid, 'group/totop/multi', '批量更新', 'fa fa-circle-o', 0, 'normal', 0);
