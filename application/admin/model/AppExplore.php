<?php

namespace app\admin\model;

use think\Model;

/**
 * 探索位 / 运营位
 */
class AppExplore extends Model
{
    protected $name = 'app_explore';

    /** 不在模型层自动写入创建/更新时间，由库表 DEFAULT 或业务自行维护 */
    protected $autoWriteTimestamp = false;

    public static function getPositionList()
    {
        return [
            'indexTop' => __('Position index top'),
            'indexTMid' => __('Position index mid'),
            'tab'      => __('Position tab'),
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

    public static function getIsOpenList()
    {
        return [
            1 => __('Explore open yes'),
            2 => __('Explore open no'),
        ];
    }
}
