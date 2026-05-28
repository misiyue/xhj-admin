<?php

namespace app\admin\model;

use think\Model;

/**
 * 汇美支付订单
 */
class MerchantHdOrder extends Model
{
    protected $table = 'merchant_hd_order';

    protected $autoWriteTimestamp = false;

    public static function getStatusList()
    {
        return [
            'success' => __('Status success'),
        ];
    }

    public static function formatDisplayDatetime($value)
    {
        $value = trim((string)$value);
        if ($value === '' || $value === '0000-00-00 00:00:00') {
            return '-';
        }
        return $value;
    }
}
