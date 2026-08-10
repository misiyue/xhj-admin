<?php

namespace app\admin\model;

use think\Model;

/**
 * 火箭资讯
 */
class AppNews extends Model
{
    protected $name = 'app_news';

    protected $autoWriteTimestamp = false;

    public static function getCollectTypeList()
    {
        return [
            'image_text' => __('Collect type image_text'),
            'video'      => __('Collect type video'),
        ];
    }

    public static function getNewsTypeList()
    {
        return [
            'global_hot'   => __('News type global_hot'),
            'crypto'       => __('News type crypto'),
            'realtime_hot' => __('News type realtime_hot'),
        ];
    }

    public static function getSourceList()
    {
        return [
            'youtube'  => __('Source youtube'),
            'twitter'  => __('Source twitter'),
            'nytimes'  => __('Source nytimes'),
            'telegram' => __('Source telegram'),
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
}
