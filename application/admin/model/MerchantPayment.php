<?php

namespace app\admin\model;

use think\Model;

/**
 * 第三方支付通道
 */
class MerchantPayment extends Model
{
    protected $table = 'merchant_payment';

    protected $autoWriteTimestamp = false;

    public const PLATFORM_HD = 'hd';
    public const PLATFORM_HM = 'hm';

    public static function getPlatformList()
    {
        return [
            self::PLATFORM_HD => __('Platform hd'),
            self::PLATFORM_HM => __('Platform hm'),
        ];
    }

    /**
     * 列表/编辑展示：【code】title (min-max)
     *
     * @param array $row
     * @return string
     */
    public static function formatDisplayLabel(array $row)
    {
        $code = trim((string)($row['code'] ?? ''));
        $title = trim((string)($row['title'] ?? ''));
        $name = $title !== '' ? $title : $code;
        $min = $row['min'] ?? null;
        $max = $row['max'] ?? null;
        if ($min !== null && $min !== '' && $max !== null && $max !== '') {
            return '【' . $code . '】' . $name . ' (' . $min . '-' . $max . ')';
        }
        return '【' . $code . '】' . $name;
    }

    public function setMinAttr($value)
    {
        return ($value === '' || $value === null) ? null : (int)$value;
    }

    public function setMaxAttr($value)
    {
        return ($value === '' || $value === null) ? null : (int)$value;
    }

    public function setTitleAttr($value)
    {
        $value = trim((string)$value);
        return $value === '' ? null : $value;
    }

    public function setCodeAttr($value)
    {
        return trim((string)$value);
    }
}
