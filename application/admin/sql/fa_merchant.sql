-- 商户表（默认数据库表前缀为 fa_，与 application/admin/model/Merchant.php 中 $name = 'merchant' 对应物理表名：fa_merchant）
-- 若你已有无前缀表 `merchant`，请改名为 fa_merchant，或在模型中设置与实际表名一致。

CREATE TABLE IF NOT EXISTS `fa_merchant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `nickname` varchar(100) CHARACTER SET utf8 NOT NULL COMMENT '商户名称',
  `realname` varchar(100) NOT NULL COMMENT '姓名',
  `nation` varchar(100) NOT NULL COMMENT '国籍',
  `id_type` tinyint(4) NOT NULL COMMENT '证件类型',
  `idcard` varchar(30) NOT NULL COMMENT '证件号码',
  `image` varchar(255) NOT NULL COMMENT '证件图片',
  `backimage` varchar(255) DEFAULT NULL COMMENT '证件背面',
  `surety` decimal(12,4) NOT NULL DEFAULT '0.0000' COMMENT '保证金',
  `surety_bill_id` int(11) NOT NULL DEFAULT '0' COMMENT '保证金冻结账单id，驳回解冻后归零',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '审核状态 0待审核 1审核通过 2驳回',
  `reason` varchar(255) DEFAULT NULL COMMENT '驳回原因',
  `is_limit` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否被限制',
  `limit_time` int(11) NOT NULL DEFAULT '0' COMMENT '限制截止时间',
  `is_frozen` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否被封禁',
  `frozen_time` int(11) NOT NULL DEFAULT '0' COMMENT '封禁截止时间',
  `is_close` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否被关停',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户';

-- 菜单与权限节点 name 须为 merchant/merchant、merchant/merchant/index 等；
-- 请在后台「权限管理 → 菜单规则」中新增菜单，父级选业务分组，控制器填写 merchant.merchant 或按 FastAdmin 习惯添加「商户管理」及子节点 index、auditlist、audit。
