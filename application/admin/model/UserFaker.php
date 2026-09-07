<?php

namespace app\admin\model;

use think\Model;

/**
 * 假人模型
 */
class UserFaker extends Model
{
    // 表名（无前缀）
    protected $table = 'user_faker';

    // 自动时间戳关闭，通过事件自定义维护
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
}
