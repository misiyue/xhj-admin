<?php

namespace app\admin\model;

use think\Model;

/**
 * 通知模板
 */
class NoticeTemplate extends Model
{
    protected $name = 'notice_template';

    protected $autoWriteTimestamp = false;

    public static function getFlagList()
    {
        return [
            'userChat' => __('Flag userChat'),
            'c2cChat'  => __('Flag c2cChat'),
            'c2cPaid'  => __('Flag c2cPaid'),
            'c2cTrans' => __('Flag c2cTrans'),
        ];
    }

    public static function getFlagText($flag)
    {
        $list = self::getFlagList();
        return $list[$flag] ?? (string)$flag;
    }
}
