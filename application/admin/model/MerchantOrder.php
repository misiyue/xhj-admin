<?php

namespace app\admin\model;

use think\Model;

/**
 * 商户订单
 */
class MerchantOrder extends Model
{
    /** 物理表名（无前缀，与线上一致） */
    protected $table = 'merchant_order';

    protected $autoWriteTimestamp = false;

    public static function getStatusList()
    {
        return [
            0 => __('Status pending pay'),
            1 => __('Status pending release'),
            2 => __('Status completed'),
            3 => __('Status cancelled'),
            4 => __('Status appealing'),
        ];
    }

    public static function getPayTypeList()
    {
        return [
            0 => __('Pay type unknown'),
            1 => __('Pay type bank'),
            2 => __('Pay type alipay'),
            3 => __('Pay type wechat'),
        ];
    }

    public static function getBuyTypeList()
    {
        return [
            0 => __('Buy type unknown'),
            1 => __('Buy type by amount'),
            2 => __('Buy type by quantity'),
        ];
    }

    public static function getAppealIdList()
    {
        return [
            0 => __('None'),
            1 => __('Appeal buyer'),
            2 => __('Appeal seller'),
        ];
    }

    public static function getWrongerList()
    {
        return [
            0 => __('Wronger none'),
            1 => __('Wronger buyer'),
            2 => __('Wronger seller'),
        ];
    }

    public static function getYesNoList()
    {
        return [
            0 => __('No'),
            1 => __('Yes'),
        ];
    }

    public static function formatUnixTime($time)
    {
        $time = (int)$time;
        return $time > 0 ? date('Y-m-d H:i:s', $time) : '-';
    }

    public static function formatPayImgUrl($img)
    {
        $img = (string)$img;
        return $img !== '' ? cdnurl($img, true) : '';
    }
}
