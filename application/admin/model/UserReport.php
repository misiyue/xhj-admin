<?php

namespace app\admin\model;

use think\Model;

/**
 * 用户举报
 */
class UserReport extends Model
{
    protected $name = 'user_report';

    protected $autoWriteTimestamp = false;

    public static function getStatusList()
    {
        return [
            0 => __('Pending'),
            1 => __('Processed'),
        ];
    }

    public static function getResultList()
    {
        return [
            0  => __('Not handled'),
            -1 => __('Ignore'),
            1  => __('Account ban'),
            2  => __('Group mute'),
        ];
    }

    public static function getDefeTypeList()
    {
        return [
            1 => __('Report target user'),
            2 => __('Report target group'),
        ];
    }
}
