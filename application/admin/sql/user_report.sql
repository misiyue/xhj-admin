-- 用户举报表（若已存在可跳过）
CREATE TABLE IF NOT EXISTS `user_report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT '上诉人用户id',
  `defe_id` int(11) DEFAULT NULL COMMENT '被诉人用户或群id',
  `defe_type` tinyint(4) DEFAULT NULL COMMENT '被诉人类型：1-用户，2-群',
  `reason` varchar(255) DEFAULT NULL COMMENT '原因',
  `status` tinyint(4) DEFAULT '0' COMMENT '状态：0-待处理，1-已处理',
  `result` tinyint(4) DEFAULT '0' COMMENT '处理结果：-1-忽略，1-账号封禁，2-群禁言',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户举报表';

-- 菜单权限（规则 user/report）
-- 推荐命令：php think menu -c user/report
--
-- 或手动插入（表前缀 fa_ 请按实际替换）：
-- SET @user_pid = (SELECT `id` FROM `fa_auth_rule` WHERE `name` = 'user' LIMIT 1);
-- INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `status`, `weigh`)
-- VALUES ('file', IFNULL(@user_pid, 0), 'user/report', '用户举报', 'fa fa-flag', 1, 'normal', 0);
-- SET @report_pid = LAST_INSERT_ID();
-- INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `status`, `weigh`) VALUES
-- ('file', @report_pid, 'user/report/index', '查看', 'fa fa-circle-o', 0, 'normal', 0),
-- ('file', @report_pid, 'user/report/detail', '详情', 'fa fa-circle-o', 0, 'normal', 0);
