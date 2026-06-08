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
     * 宏达支付通道（分组）
     *
     * @return array<int, array{channels: array<string, array{name:string,min:int,max:int}>}>
     */
    public static function getHdPayChannelGroups()
    {
        return [
            [
                'channels' => [
                    '801' => ['name' => '小额', 'min' => 200, 'max' => 1000],
                    '802' => ['name' => '中额', 'min' => 500, 'max' => 3000],
                    '803' => ['name' => '大额', 'min' => 800, 'max' => 20000],
                ],
            ],
            [
                'channels' => [
                    '1001' => ['name' => '小额金条', 'min' => 100, 'max' => 1000],
                    '1002' => ['name' => '小额金条', 'min' => 200, 'max' => 2000],
                    '1003' => ['name' => '中额金条', 'min' => 300, 'max' => 3000],
                    '1004' => ['name' => '中大额金条', 'min' => 500, 'max' => 3000],
                    '1005' => ['name' => '大额金条', 'min' => 800, 'max' => 3000],
                ],
            ],
            [
                'channels' => [
                    '301' => ['name' => '小额银联扫码', 'min' => 50, 'max' => 500],
                    '302' => ['name' => '中额银联扫码', 'min' => 100, 'max' => 500],
                    '303' => ['name' => '大额银联扫码', 'min' => 200, 'max' => 500],
                ],
            ],
            [
                'channels' => [
                    '1304' => ['name' => '数字货币', 'min' => 10, 'max' => 2000],
                ],
            ],
            [
                'channels' => [
                    '201' => ['name' => '微信', 'min' => 100, 'max' => 2000],
                ],
            ],
        ];
    }

    /**
     * 宏达支付通道 code => 配置
     *
     * @return array<string, array{name:string,min:int,max:int}>
     */
    public static function getHdPayChannelList()
    {
        $list = [];
        foreach (self::getHdPayChannelGroups() as $group) {
            foreach ($group['channels'] as $code => $channel) {
                $list[(string)$code] = $channel;
            }
        }
        return $list;
    }

    /**
     * @param string|int $code
     * @return array{name:string,min:int,max:int}|null
     */
    public static function getHdPayChannel($code)
    {
        $code = trim((string)$code);
        if ($code === '') {
            return null;
        }
        $list = self::getHdPayChannelList();
        if (isset($list[$code])) {
            return $list[$code];
        }
        return $list[(string)(int)$code] ?? null;
    }

    /**
     * 编辑页通道选项（含分组起始标记）
     *
     * @return array<int, array{code:string,name:string,min:int,max:int,group_start:bool}>
     */
    public static function getHdPayChannelOptionsForView()
    {
        $options = [];
        foreach (self::getHdPayChannelGroups() as $groupIndex => $group) {
            $firstInGroup = true;
            foreach ($group['channels'] as $code => $channel) {
                $options[] = [
                    'code'         => (string)$code,
                    'name'         => $channel['name'],
                    'min'          => (int)$channel['min'],
                    'max'          => (int)$channel['max'],
                    'group_start'  => $firstInGroup && $groupIndex > 0,
                ];
                $firstInGroup = false;
            }
        }
        return $options;
    }

    /**
     * 宏达支付通道名称（兼容旧调用）
     */
    public static function getHdPayTypeList()
    {
        $list = [];
        foreach (self::getHdPayChannelList() as $code => $channel) {
            $list[$code] = $channel['name'];
        }
        return $list;
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
                $result[$code] = $code === self::PAY_TYPE_HD
                    ? ['pay_type' => '', 'min' => 0, 'max' => 0]
                    : [];
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
                $min = null;
                $max = null;
                if (is_array($cfg)) {
                    if (isset($cfg['pay_type'])) {
                        $payType = trim((string)$cfg['pay_type']);
                    }
                    if (isset($cfg['min'])) {
                        $min = (int)$cfg['min'];
                    }
                    if (isset($cfg['max'])) {
                        $max = (int)$cfg['max'];
                    }
                }
                $channel = $payType !== '' ? self::getHdPayChannel($payType) : null;
                $result[$code] = [
                    'pay_type' => $payType,
                    'min'      => $min !== null ? $min : ($channel['min'] ?? 0),
                    'max'      => $max !== null ? $max : ($channel['max'] ?? 0),
                ];
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
        $labels = [];
        foreach ($payTypesData as $code => $cfg) {
            $name = $typeList[$code] ?? $code;
            if ($code === self::PAY_TYPE_HD) {
                $payType = is_array($cfg) ? trim((string)($cfg['pay_type'] ?? '')) : '';
                $channel = $payType !== '' ? self::getHdPayChannel($payType) : null;
                if ($channel) {
                    $min = is_array($cfg) && isset($cfg['min']) ? (int)$cfg['min'] : $channel['min'];
                    $max = is_array($cfg) && isset($cfg['max']) ? (int)$cfg['max'] : $channel['max'];
                    $labels[] = $name . ' · 【' . $payType . '】' . $channel['name'] . ' (' . $min . '-' . $max . ')';
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
        $list = self::getHdPayChannelList();
        return isset($list[$hdPayType]) || isset($list[(string)(int)$hdPayType]);
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
        $result = [];

        foreach ($enabledCodes as $code) {
            if ($code === self::PAY_TYPE_HD) {
                $payTypeKey = isset(self::getHdPayChannelList()[$hdPayType])
                    ? $hdPayType
                    : (string)(int)$hdPayType;
                $channel = self::getHdPayChannel($payTypeKey);
                if ($channel === null) {
                    throw new \InvalidArgumentException('Hd pay type required');
                }
                $result[$code] = [
                    'pay_type' => $payTypeKey,
                    'min'      => (int)$channel['min'],
                    'max'      => (int)$channel['max'],
                ];
            } else {
                $result[$code] = new \stdClass();
            }
        }

        $json = json_encode($result, JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            throw new \RuntimeException(json_last_error_msg() ?: 'json_encode failed');
        }

        return $json;
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
