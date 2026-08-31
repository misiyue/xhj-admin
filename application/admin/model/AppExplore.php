<?php

namespace app\admin\model;

use think\Model;

/**
 * 探索位 / 运营位
 */
class AppExplore extends Model
{
    protected $name = 'app_explore';

    protected $autoWriteTimestamp = false;

    public static function getPositionList()
    {
        return [
            'indexTop'  => __('Position index top'),
            'indexTMid' => __('Position index mid'),
            'idxBanner' => __('Position index banner'),
            'tab'       => __('Position tab'),
            'game'      => __('Position game'),
            'appBtmTab' => __('Position app bottom tab'),
        ];
    }

    public static function getEndsList()
    {
        return [
            'h5'  => __('End h5'),
            'pc'  => __('End pc'),
            'app' => __('End app'),
        ];
    }

    public function setSortAttr($value)
    {
        if ($value === '' || $value === null) {
            return 0;
        }
        return (int)$value;
    }

    public function setPositionAttr($value)
    {
        if ($value === '' || $value === null) {
            return null;
        }
        return $value;
    }

    public function setDigestAttr($value)
    {
        return $value === '' ? null : $value;
    }

    public function setEndsAttr($value)
    {
        if (is_array($value)) {
            return implode(',', array_filter(array_values($value)));
        }
        return $value;
    }
}
