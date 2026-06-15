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

    protected static function init()
    {
        self::beforeInsert(function ($row) {
            $now = date('Y-m-d H:i:s');
            if (empty($row['created_at'])) {
                $row['created_at'] = $now;
            }
            if (empty($row['updated_at'])) {
                $row['updated_at'] = $now;
            }
        });
        self::beforeUpdate(function ($row) {
            $row['updated_at'] = date('Y-m-d H:i:s');
        });
    }

    public static function getStatusList()
    {
        return [
            0 => __('Status closed'),
            1 => __('Status open'),
        ];
    }
}
