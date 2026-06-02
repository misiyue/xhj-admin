<?php

namespace app\admin\model;

use think\Model;

/**
 * 商户
 */
class Merchant extends Model
{
    protected $name = 'merchant';

    public const PAY_TYPE_HD = 'hd';
    public const PAY_TYPE_HM = 'hm';

    public static function getPayTypeList()
    {
        return [
            self::PAY_TYPE_HD => __('Pay type hd'),
            self::PAY_TYPE_HM => __('Pay type hm'),
        ];
    }

    /**
     * 宏达支付额度
     */
    public static function getHdPayTypeList()
    {
        return [
            '801' => __('Hd quota 801'),
            '802' => __('Hd quota 802'),
            '803' => __('Hd quota 803'),
        ];
    }

    /**
     * 解析 pay_types 为配置对象 [hd => ['pay_type'=>'801'], hm => []]
     *
     * @param mixed $json
     * @return array<string, array>
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
                $decoded = json_decode(stripslashes($json), true);
            }
            if (!is_array($decoded)) {
                return [];
            }
        }

        $allowed = array_keys(self::getPayTypeList());
        $result = [];

        // 兼容旧版 ["hd","hm"]
        if (self::isListArray($decoded)) {
            foreach ($decoded as $item) {
                $code = (string)$item;
                if (!in_array($code, $allowed, true)) {
                    continue;
                }
                $result[$code] = $code === self::PAY_TYPE_HD ? ['pay_type' => ''] : [];
            }
            return $result;
        }

        foreach ($decoded as $code => $cfg) {
            $code = (string)$code;
            if (!in_array($code, $allowed, true)) {
                continue;
            }
            if ($code === self::PAY_TYPE_HD) {
                $payType = '';
                if (is_array($cfg) && isset($cfg['pay_type'])) {
                    $payType = trim((string)$cfg['pay_type']);
                }
                $result[$code] = ['pay_type' => $payType];
            } else {
                $result[$code] = [];
            }
        }

        return $result;
    }

    /**
     * 已开通的支付类型 code 列表
     *
     * @param mixed $json
     * @return array
     */
    public static function parsePayTypes($json)
    {
        return array_keys(self::parsePayTypesData($json));
    }

    /**
     * 列表展示文案
     *
     * @param array<string, array> $payTypesData
     * @return array
     */
    public static function buildPayTypesDisplayLabels(array $payTypesData)
    {
        $typeList = self::getPayTypeList();
        $hdQuotas = self::getHdPayTypeList();
        $labels = [];
        foreach ($payTypesData as $code => $cfg) {
            $name = $typeList[$code] ?? $code;
            if ($code === self::PAY_TYPE_HD) {
                $payType = is_array($cfg) ? trim((string)($cfg['pay_type'] ?? '')) : '';
                $quotaLabel = $hdQuotas[$payType] ?? $hdQuotas[(int)$payType] ?? null;
                if ($payType !== '' && $quotaLabel !== null) {
                    $labels[] = $name . ' · ' . $quotaLabel;
                } else {
                    $labels[] = $name;
                }
            } else {
                $labels[] = $name;
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
        if (self::isListArray($payTypes)) {
            return array_values(array_unique(array_map('strval', $payTypes)));
        }
        return array_values(array_unique(array_map('strval', array_keys($payTypes))));
    }

    public static function normalizeHdPayType($hdPayType)
    {
        if (is_array($hdPayType)) {
            $hdPayType = reset($hdPayType);
        }
        return trim((string)$hdPayType);
    }

    public static function isValidHdPayType($hdPayType)
    {
        $hdPayType = self::normalizeHdPayType($hdPayType);
        if ($hdPayType === '') {
            return false;
        }
        $list = self::getHdPayTypeList();
        return isset($list[$hdPayType]) || isset($list[(int)$hdPayType]);
    }

    /**
     * 保存结构编码为 JSON
     *
     * @param mixed       $enabledCodes 勾选的支付类型 hd/hm
     * @param string|null $hdPayType    宏达额度 801/802/803
     * @return string|null
     */
    public static function encodePayTypesConfig($enabledCodes, $hdPayType = null)
    {
        $allowed = array_keys(self::getPayTypeList());
        $enabledCodes = array_values(array_intersect(self::normalizeEnabledCodes($enabledCodes), $allowed));
        if (!$enabledCodes) {
            return null;
        }

        $hdPayType = self::normalizeHdPayType($hdPayType);
        $hdPayTypeList = self::getHdPayTypeList();
        $result = [];

        foreach ($enabledCodes as $code) {
            if ($code === self::PAY_TYPE_HD) {
                if (!isset($hdPayTypeList[$hdPayType]) && !isset($hdPayTypeList[(int)$hdPayType])) {
                    throw new \InvalidArgumentException('Hd pay type required');
                }
                $payTypeKey = isset($hdPayTypeList[$hdPayType]) ? $hdPayType : (string)(int)$hdPayType;
                $result[$code] = ['pay_type' => $payTypeKey];
            } else {
                $result[$code] = (object)[];
            }
        }

        return json_encode($result, JSON_UNESCAPED_UNICODE);
    }

    /**
     * @param array $arr
     * @return bool
     */
    protected static function isListArray(array $arr)
    {
        if ($arr === []) {
            return true;
        }
        return array_keys($arr) === range(0, count($arr) - 1);
    }
}
