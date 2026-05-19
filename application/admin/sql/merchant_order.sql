-- 商户订单表（与线上一致使用 merchant_order，模型 MerchantOrder 已设置 protected $table = 'merchant_order'）
-- 若使用 fa_ 前缀，请改表名为 fa_merchant_order 并修改模型 $table 或 $name。

CREATE TABLE IF NOT EXISTS `merchant_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(64) NOT NULL COMMENT '订单号',
  `buyer_id` int(11) NOT NULL COMMENT '买家id',
  `saler_id` int(11) NOT NULL COMMENT '卖家id',
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '总金额',
  `task_id` int(11) NOT NULL DEFAULT '0' COMMENT '任务id',
  `counts` float(12,4) NOT NULL DEFAULT '0.0000' COMMENT '购买数量',
  `pay_type` tinyint(1) DEFAULT '0' COMMENT '支付方式',
  `buy_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '购买方式',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '订单状态',
  `pay_img` varchar(255) DEFAULT NULL COMMENT '支付凭证',
  `is_cancel` tinyint(1) DEFAULT '0' COMMENT '是否取消：0-否，1-是',
  `is_appeal` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否申诉：0-否，1-是',
  `appeal_id` tinyint(1) NOT NULL DEFAULT '0' COMMENT '申诉方 1买方 2卖方',
  `appeal_time` int(11) NOT NULL DEFAULT '0' COMMENT '申诉时间',
  `appeal_reason` varchar(255) DEFAULT NULL COMMENT '申诉原因',
  `cancel_id` smallint(6) NOT NULL DEFAULT '0' COMMENT '订单取消原因编号',
  `remark` varchar(255) DEFAULT NULL COMMENT '订单取消原因',
  `pay_time` int(11) DEFAULT '0' COMMENT '支付时间',
  `cancel_time` int(11) DEFAULT '0' COMMENT '取消时间',
  `wronger` tinyint(1) NOT NULL DEFAULT '0' COMMENT '过错方 0无 1买家 2卖家',
  `judge` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '裁定结果',
  `judge_time` int(11) NOT NULL DEFAULT '0' COMMENT '裁定时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id_idx` (`order_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户订单';

-- 菜单：merchant/order，子节点 index、detail
