<?php

namespace app\admin\model;

use app\common\library\VideoCover;
use think\Model;

/**
 * 火箭资讯
 */
class AppNews extends Model
{
    protected $name = 'app_news';

    protected $autoWriteTimestamp = false;

    protected static function init()
    {
        $fillCover = function ($row) {
            $typeId = isset($row['type_id']) ? (int)$row['type_id'] : 0;
            $cover = isset($row['cover']) ? trim((string)$row['cover']) : '';
            if ($typeId !== 2 || $cover !== '') {
                return;
            }
            $content = isset($row['content']) ? trim((string)$row['content']) : '';
            if ($content === '') {
                return;
            }
            $url = VideoCover::capture($content);
            if ($url !== '') {
                $row['cover'] = $url;
            }
        };
        self::beforeInsert($fillCover);
        self::beforeUpdate($fillCover);
    }

    public static function getTypeList()
    {
        return [
            1 => __('Type image_text'),
            2 => __('Type video'),
        ];
    }

    public static function getStatusList()
    {
        return [
            0  => __('Status draft'),
            1  => __('Status published'),
            -1 => __('Status offline'),
        ];
    }

    public function setUploadTimeAttr($value)
    {
        return $value === '' || $value === null ? null : $value;
    }

    public function setPublishTimeAttr($value)
    {
        return $value === '' || $value === null ? null : $value;
    }

    public function setCoverAttr($value)
    {
        return $value === '' ? null : $value;
    }

    public function setSourceUrlAttr($value)
    {
        return $value === '' ? null : $value;
    }

    public function setCategoryIdAttr($value)
    {
        return (int)$value;
    }

    public function setTypeIdAttr($value)
    {
        if ($value === '' || $value === null) {
            return null;
        }
        return (int)$value;
    }
}
