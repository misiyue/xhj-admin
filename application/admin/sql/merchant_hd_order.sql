-- 汇美支付订单（模型 MerchantHdOrder 使用 protected $table = 'merchant_hd_order'）

CREATE TABLE IF NOT EXISTS `merchant_hd_order` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(64) NOT NULL DEFAULT '' COMMENT '商户订单号',
  `local_no` varchar(64) NOT NULL DEFAULT '' COMMENT '平台订单号',
  `pay_url` varchar(255) NOT NULL DEFAULT '' COMMENT '支付url',
  `submit_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单提交金额（商户传入）',
  `status` varchar(16) NOT NULL DEFAULT '' COMMENT '订单状态标识：success=成功,其他失败',
  `status_text` varchar(16) NOT NULL DEFAULT '' COMMENT '订单状态说明',
  `payed_at` datetime DEFAULT NULL COMMENT '支付时间，未支付为空',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='汇美支付订单';

-- 菜单：merchant/hdpay，子节点 index、detail
-- 若由 merchant_hm_order 更名：RENAME TABLE `merchant_hm_order` TO `merchant_hd_order`;
