<?php

namespace app\admin\validate;

use app\admin\model\MerchantPayment as MerchantPaymentModel;
use think\Validate;

class MerchantPayment extends Validate
{
    protected $rule = [
        'title'    => 'max:16',
        'code'     => 'require|max:8|checkCodePlatform',
        'min'      => 'checkLimit',
        'max'      => 'checkLimit|checkLimitRange',
        'platform' => 'require|in:hd,hm',
    ];

    protected $scene = [
        'add'  => ['title', 'code', 'min', 'max', 'platform'],
        'edit' => ['title', 'code', 'min', 'max', 'platform'],
    ];

    protected function checkLimit($value, $rule, $data = [])
    {
        if ($value === '' || $value === null) {
            return true;
        }
        if (!is_numeric($value) || (int)$value < 0) {
            return __('Limit invalid');
        }
        return true;
    }

    protected function checkLimitRange($value, $rule, $data = [])
    {
        $min = $data['min'] ?? null;
        $max = $data['max'] ?? null;
        if ($min === '' || $min === null || $max === '' || $max === null) {
            return true;
        }
        if ((int)$min > (int)$max) {
            return __('Max must gte min');
        }
        return true;
    }

    protected function checkCodePlatform($value, $rule, $data = [])
    {
        $platform = trim((string)($data['platform'] ?? ''));
        if ($platform === '') {
            return true;
        }
        $query = MerchantPaymentModel::where('code', trim((string)$value))
            ->where('platform', $platform);
        if (!empty($data['id'])) {
            $query->where('id', '<>', (int)$data['id']);
        }
        if ($query->find()) {
            return __('Code platform exists');
        }
        return true;
    }
}
