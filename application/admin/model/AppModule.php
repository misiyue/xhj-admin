<?php

namespace app\admin\model;

use think\Model;

/**
 * App 模块开关
 */
class AppModule extends Model
{
    protected $name = 'app_module';

    protected $autoWriteTimestamp = false;

    public static function getIsOpenList()
    {
        return [
            1 => __('Yes'),
            0 => __('No'),
        ];
    }
}
