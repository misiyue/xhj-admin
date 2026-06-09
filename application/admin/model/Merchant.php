<?php

namespace app\admin\model;

use think\Model;

/**
 * 商户
 */
class Merchant extends Model
{
    protected $name = 'merchant';

    /**
     * 解析 pay_types => [hd => merchant_payment.id, hm => merchant_payment.id]
     *
     * @param mixed $json
     * @return array<string, int>
     */
    public static function parsePayTypesData($json)
    {
        if (is_array($json)) {
            $decoded = $json;
        } else {
            $json = trim((string)$json);
            if ($json === '') {
                return [];
            }
            $decoded = json_decode($json, true);
            if (!is_array($decoded)) {
                return [];
            }
        }

        $allowed = array_keys(MerchantPayment::getPlatformList());
        $result = [];

        foreach ($decoded as $code => $value) {
            $code = (string)$code;
            if (!in_array($code, $allowed, true)) {
                continue;
            }
            $result[$code] = is_numeric($value) ? (int)$value : 0;
        }

        return $result;
    }

    /**
     * 编辑页：某平台下的 merchant_payment 选项
     *
     * @param string $platform hd/hm
     * @return array<int, array{id:int,code:string,title:string,name:string,min:mixed,max:mixed}>
     */
    public static function getPaymentOptionsForView($platform)
    {
        $platform = trim((string)$platform);
        if (!isset(MerchantPayment::getPlatformList()[$platform])) {
            return [];
        }
        $rows = MerchantPayment::where('platform', $platform)->order('code', 'asc')->select();
        $options = [];
        foreach ($rows as $row) {
            $arr = $row instanceof Model ? $row->toArray() : (array)$row;
            $title = trim((string)($arr['title'] ?? ''));
            $options[] = [
                'id'    => (int)$arr['id'],
                'code'  => (string)$arr['code'],
                'title' => $title,
                'name'  => $title !== '' ? $title : (string)$arr['code'],
                'min'   => $arr['min'],
                'max'   => $arr['max'],
            ];
        }
        return $options;
    }

    /**
     * @param int|string $paymentId
     * @param string     $platform
     * @return bool
     */
    public static function isValidPaymentId($paymentId, $platform)
    {
        $paymentId = (int)$paymentId;
        $platform = trim((string)$platform);
        if ($paymentId <= 0 || !isset(MerchantPayment::getPlatformList()[$platform])) {
            return false;
        }
        return MerchantPayment::where('id', $paymentId)->where('platform', $platform)->count() > 0;
    }

    /**
     * 列表展示文案
     *
     * @param array<string, int> $payTypesData
     * @return array
     */
    public static function buildPayTypesDisplayLabels(array $payTypesData)
    {
        if ($payTypesData === []) {
            return [];
        }

        $paymentIds = array_values(array_unique(array_filter(array_map('intval', $payTypesData))));
        $paymentMap = [];
        if ($paymentIds) {
            $payments = MerchantPayment::where('id', 'in', $paymentIds)->select();
            foreach ($payments as $payment) {
                $arr = $payment instanceof Model ? $payment->toArray() : (array)$payment;
                $paymentMap[(int)$arr['id']] = $arr;
            }
        }

        $typeList = MerchantPayment::getPlatformList();
        $labels = [];
        foreach ($payTypesData as $code => $paymentId) {
            $paymentId = (int)$paymentId;
            if ($paymentId <= 0) {
                continue;
            }
            $name = $typeList[$code] ?? $code;
            if (isset($paymentMap[$paymentId])) {
                $labels[] = $name . ' · ' . MerchantPayment::formatDisplayLabel($paymentMap[$paymentId]);
            } else {
                $labels[] = $name . ' · #' . $paymentId;
            }
        }
        return $labels;
    }

    /**
     * 规范化 POST 的 pay_types（兼容仅勾选一个时为字符串）
     *
     * @param mixed $payTypes
     * @return array
     */
    public static function normalizeEnabledCodes($payTypes)
    {
        if (!is_array($payTypes)) {
            $payTypes = trim((string)$payTypes);
            return $payTypes === '' ? [] : [$payTypes];
        }
        return array_values(array_unique(array_map('strval', $payTypes)));
    }

    /**
     * 保存为 JSON：{"hd":5,"hm":12}
     *
     * @param mixed $enabledCodes
     * @param array $paymentIds [hd=>5, hm=>12]
     * @return string|null
     */
    public static function encodePayTypesConfig($enabledCodes, array $paymentIds = [])
    {
        $allowed = array_keys(MerchantPayment::getPlatformList());
        $enabledCodes = array_values(array_intersect(self::normalizeEnabledCodes($enabledCodes), $allowed));
        if (!$enabledCodes) {
            return null;
        }

        $result = [];
        foreach ($enabledCodes as $code) {
            $paymentId = isset($paymentIds[$code]) ? (int)$paymentIds[$code] : 0;
            if (!self::isValidPaymentId($paymentId, $code)) {
                throw new \InvalidArgumentException('Payment channel required');
            }
            $result[$code] = $paymentId;
        }

        $json = json_encode($result, JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            throw new \RuntimeException(json_last_error_msg() ?: 'json_encode failed');
        }

        return $json;
    }
}
