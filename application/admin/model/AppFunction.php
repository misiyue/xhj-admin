<?php

namespace app\admin\model;

use think\Model;

/**
 * App 功能开关
 */
class AppFunction extends Model
{
    protected $name = 'app_function';

    protected $autoWriteTimestamp = false;

    public static function getIsOpenList()
    {
        return [
            1 => __('Yes'),
            0 => __('No'),
        ];
    }
}
