<?php

namespace app\admin\model;

use think\Model;

/**
 * 商户挂单任务
 */
class MerchantTask extends Model
{
    protected $table = 'merchant_task';

    protected $autoWriteTimestamp = false;

    public static function getStatusList()
    {
        return [
            0 => __('Task status pending'),
            1 => __('Task status trading'),
            2 => __('Task status done'),
        ];
    }

    public static function getCurrencyTypeList()
    {
        return [
            1 => __('Currency u coin'),
        ];
    }

    public static function getPaytypeIdList()
    {
        return [
            1 => __('Paytype alipay'),
            2 => __('Paytype wechat'),
            3 => __('Paytype bank'),
            4 => __('Paytype huimei'),
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

    /**
     * 解析 paytype JSON 为列表（含展示文案）
     *
     * @param string|null $json
     * @return array
     */
    public static function parsePaytypeList($json)
    {
        $json = trim((string)$json);
        if ($json === '') {
            return [];
        }
        $decoded = json_decode($json, true);
        if (!is_array($decoded)) {
            return [];
        }
        if (isset($decoded['type_id'])) {
            $decoded = [$decoded];
        }
        $typeList = self::getPaytypeIdList();
        $result = [];
        foreach ($decoded as $item) {
            if (!is_array($item)) {
                continue;
            }
            $typeId = (int)($item['type_id'] ?? 0);
            $result[] = [
                'type_id'       => $typeId,
                'type_id_text'  => $typeList[$typeId] ?? (string)$typeId,
                'account'       => (string)($item['account'] ?? ''),
                'nickname'      => (string)($item['nickname'] ?? ''),
                'open_bank'     => (string)($item['open_bank'] ?? ''),
            ];
        }
        return $result;
    }
}
