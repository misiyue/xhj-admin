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

    /** 支付类型：与 merchant_order.pay_type_id 一致 */
    public const PAY_TYPE_ALIPAY = 1;
    public const PAY_TYPE_WECHAT = 2;
    public const PAY_TYPE_BANK = 3;
    public const PAY_TYPE_HD = 4;
    public const PAY_TYPE_HM = 5;

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
            self::PAY_TYPE_ALIPAY => __('Pay type alipay'),
            self::PAY_TYPE_WECHAT  => __('Pay type wechat'),
            self::PAY_TYPE_BANK    => __('Pay type bank'),
            self::PAY_TYPE_HD      => __('Pay type hd'),
            self::PAY_TYPE_HM      => __('Pay type hm'),
        ];
    }

    /**
     * @param int $payTypeId
     * @return bool
     */
    public static function isValidPayTypeId($payTypeId)
    {
        return in_array((int)$payTypeId, [
            self::PAY_TYPE_ALIPAY,
            self::PAY_TYPE_WECHAT,
            self::PAY_TYPE_BANK,
            self::PAY_TYPE_HD,
            self::PAY_TYPE_HM,
        ], true);
    }

    /**
     * 规范化 pay_type_info 为 JSON 字符串入库
     *
     * @param mixed $payTypeInfo
     * @return string
     */
    public static function normalizePayTypeInfo($payTypeInfo)
    {
        if (is_array($payTypeInfo) || is_object($payTypeInfo)) {
            return json_encode($payTypeInfo, JSON_UNESCAPED_UNICODE);
        }
        $payTypeInfo = trim((string)$payTypeInfo);
        if ($payTypeInfo === '' || $payTypeInfo === '0') {
            return '';
        }
        $decoded = json_decode($payTypeInfo, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return json_encode($decoded, JSON_UNESCAPED_UNICODE);
        }
        return $payTypeInfo;
    }

    /**
     * 详情展示用
     *
     * @param mixed $payTypeInfo
     * @return string
     */
    public static function formatPayTypeInfoDisplay($payTypeInfo)
    {
        $payTypeInfo = trim((string)$payTypeInfo);
        if ($payTypeInfo === '' || $payTypeInfo === '0') {
            return '-';
        }
        $decoded = json_decode($payTypeInfo, true);
        if (is_array($decoded)) {
            $json = json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            return $json !== false ? $json : $payTypeInfo;
        }
        return $payTypeInfo;
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
