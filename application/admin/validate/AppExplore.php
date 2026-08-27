<?php

namespace app\admin\validate;

use think\Validate;

class AppExplore extends Validate
{
    protected $rule = [
        'title'    => 'max:64',
        'image'    => 'max:255',
        'digest'   => 'max:128',
        'url'      => 'max:255',
        'ends'     => 'max:32',
        'position' => 'checkPosition',
        'sort'     => 'checkSort',
    ];

    protected $scene = [
        'add'  => ['title', 'image', 'digest', 'url', 'ends', 'position', 'sort'],
        'edit' => ['title', 'image', 'digest', 'url', 'ends', 'position', 'sort'],
    ];

    /**
     * 排序：空视为 0；0～99999999 整数
     */
    protected function checkSort($value, $rule, $data = [], $field = '', $title = '')
    {
        if ($value === '' || $value === null) {
            return true;
        }
        $v = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 99999999]]);
        if ($v === false) {
            return __('Sort invalid');
        }
        return true;
    }

    /**
     * 位置：空或 indexTop / indexTMid / idxBanner / tab / game
     */
    protected function checkPosition($value, $rule, $data = [], $field = '', $title = '')
    {
        if ($value === null || $value === '') {
            return true;
        }
        if (!is_string($value) || strlen($value) > 16) {
            return __('Position invalid');
        }
        if (!in_array($value, ['indexTop', 'indexTMid', 'idxBanner', 'tab', 'game'], true)) {
            return __('Position invalid');
        }
        return true;
    }
}
