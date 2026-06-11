<?php

namespace app\admin\model;

use think\Model;

/**
 * 站内信
 */
class NoticeLetter extends Model
{
    protected $name = 'notice_letter';

    protected $autoWriteTimestamp = false;

    public static function getIsReadList()
    {
        return [
            0 => __('Is read no'),
            1 => __('Is read yes'),
        ];
    }
}
