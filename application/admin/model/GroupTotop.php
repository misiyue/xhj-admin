<?php

namespace app\admin\model;

use think\Model;

/**
 * 群置顶推广位
 */
class GroupTotop extends Model
{
    protected $table = 'group_totop';

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

    public function setSortAttr($value)
    {
        if ($value === '' || $value === null) {
            return 0;
        }
        return (int)$value;
    }

    public function setGroupIdsAttr($value)
    {
        if (is_array($value)) {
            $value = implode(',', array_filter(array_map('trim', $value)));
        }
        return $value === '' ? null : $value;
    }
}
