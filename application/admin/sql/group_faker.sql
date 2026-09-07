-- 群虚拟成员关联表
CREATE TABLE IF NOT EXISTS `group_faker` (
  `faker_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  UNIQUE KEY `uniq_idx` (`faker_id`,`group_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='群虚拟成员关联表';

-- 权限规则说明（如果需要为非超管角色分配权限）：
-- 节点包括：
-- group/faker/index (查看虚拟成员列表)
-- group/faker/add   (添加虚拟成员)
-- group/faker/del   (移除虚拟成员)
