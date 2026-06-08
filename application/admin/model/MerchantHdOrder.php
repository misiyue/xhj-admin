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

    /**
     * 宏达支付订单弹窗展示项（merchant_order.order_id = order_no）
     *
     * @param \think\Model|array $row
     * @return array<int, array{label:string,value:string,is_url?:bool}>
     */
    public static function buildDisplayItems($row)
    {
        $data = is_array($row) ? $row : $row->toArray();
        $payUrl = trim((string)($data['pay_url'] ?? ''));

        return [
            ['label' => __('Merchant order no'), 'value' => (string)($data['order_no'] ?? '-')],
            ['label' => __('Platform order no'), 'value' => (string)($data['local_no'] ?? '-')],
            ['label' => __('Hd pay type code'), 'value' => (string)($data['pay_type'] ?? '-')],
            [
                'label'  => __('Pay url'),
                'value'  => $payUrl !== '' ? $payUrl : '-',
                'is_url' => $payUrl !== '',
            ],
            ['label' => __('Submit amount'), 'value' => (string)($data['submit_amount'] ?? '-')],
            ['label' => __('Order status'), 'value' => (string)($data['status'] ?? '-')],
            ['label' => __('Status text'), 'value' => (string)($data['status_text'] ?? '-')],
            ['label' => __('Pay time'), 'value' => self::formatDisplayDatetime($data['payed_at'] ?? '')],
            ['label' => __('Createtime'), 'value' => self::formatDisplayDatetime($data['created_at'] ?? '')],
        ];
    }
}
