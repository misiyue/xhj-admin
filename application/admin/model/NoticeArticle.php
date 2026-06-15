<?php

namespace app\admin\model;

use think\Model;

/**
 * 通知文章
 */
class NoticeArticle extends Model
{
    protected $name = 'notice_article';

    protected $autoWriteTimestamp = false;

    public static function getStatusList()
    {
        return [
            0 => __('Status closed'),
            1 => __('Status open'),
        ];
    }
}
