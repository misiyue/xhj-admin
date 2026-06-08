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
  `pay_type_info` varchar(255) DEFAULT '0' COMMENT '支付信息json',
  `pay_type_id` int(11) NOT NULL DEFAULT '0' COMMENT '支付类型：1-支付宝，2-微信，3-银行卡，4-宏达，5-汇美',
  `buy_type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '购买方式',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '订单状态',
  `pay_img` varchar(255) DEFAULT NULL COMMENT '支付凭证',
  `is_cancel` tinyint(4) DEFAULT '0' COMMENT '是否取消：0-否，1-是',
  `is_appeal` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否申诉：0-否，1-是',
  `appeal_id` tinyint(4) NOT NULL DEFAULT '0' COMMENT '申诉方 1买方 2卖方',
  `appeal_time` int(11) NOT NULL DEFAULT '0' COMMENT '申诉时间',
  `appeal_reason` varchar(255) DEFAULT NULL COMMENT '申诉原因',
  `cancel_id` smallint(6) NOT NULL DEFAULT '0' COMMENT '订单取消原因编号',
  `remark` varchar(255) DEFAULT NULL COMMENT '订单取消原因',
  `pay_time` int(11) DEFAULT '0' COMMENT '支付时间',
  `cancel_time` int(11) DEFAULT '0' COMMENT '取消时间',
  `wronger` tinyint(4) NOT NULL DEFAULT '0' COMMENT '过错方 0无 1买家 2卖家',
  `judge` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '裁定结果',
  `judge_time` int(11) NOT NULL DEFAULT '0' COMMENT '裁定时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id_idx` (`order_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户订单';

-- 若表已存在（旧字段 pay_type）可执行：
-- ALTER TABLE `merchant_order`
--   ADD COLUMN `pay_type_info` varchar(255) DEFAULT '0' COMMENT '支付信息json' AFTER `counts`,
--   ADD COLUMN `pay_type_id` int(11) NOT NULL DEFAULT '0' COMMENT '支付类型：1-支付宝，2-微信，3-银行卡，4-宏达，5-汇美' AFTER `pay_type_info`;
-- UPDATE `merchant_order` SET `pay_type_info` = IFNULL(`pay_type`, '0') WHERE `pay_type_info` = '0' OR `pay_type_info` IS NULL;
-- ALTER TABLE `merchant_order` DROP COLUMN `pay_type`;

-- 用户下单接口参数（Go/PHP 业务端）：
--   pay_type_id   必填，1~5
--   pay_type_info 必填，JSON 字符串或对象（原 pay_type 字段内容）
-- PHP 可调用：\app\common\library\MerchantOrderLogic::resolvePayFields($requestParams)

-- 菜单：merchant/order，子节点 index、detail、appeallist、handle
-- 主列表：is_appeal=0 或 (is_appeal=1 且 judge_time>0)；申诉列表：is_appeal=1 且 judge_time=0 且 status=1（待放币）
