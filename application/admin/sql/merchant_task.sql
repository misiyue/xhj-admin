-- 商户挂单任务（模型 MerchantTask 使用 protected $table = 'merchant_task'）

CREATE TABLE IF NOT EXISTS `merchant_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `currency_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '出售币种 1u币',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '单价',
  `count` float(16,4) NOT NULL DEFAULT '0.0000' COMMENT '出售数量',
  `paytype` varchar(1024) DEFAULT NULL COMMENT '支付方式json数组',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态：0-待交易，1-交易中，2-完成交易',
  `is_up` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否上架：0-否，1-是',
  `up_time` int(11) NOT NULL DEFAULT '0' COMMENT '上架时间',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '删除状态',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户挂单任务';

-- 菜单：merchant/task，子节点 index、detail
