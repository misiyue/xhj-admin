<?php

namespace app\admin\model;

use think\Model;

/**
 * App 模块
 */
class AppModule extends Model
{
    protected $name = 'app_module';

    protected $autoWriteTimestamp = false;

    public static function getEndsList()
    {
        return [
            'h5'  => __('End h5'),
            'pc'  => __('End pc'),
            'app' => __('End app'),
        ];
    }

    public function setEndsAttr($value)
    {
        if (is_array($value)) {
            return implode(',', array_filter(array_values($value)));
        }
        return $value;
    }

    public static function formatEndsText($ends)
    {
        $ends = trim((string)$ends);
        if ($ends === '') {
            return '-';
        }
        $list = self::getEndsList();
        $parts = array_filter(explode(',', $ends));
        $texts = [];
        foreach ($parts as $part) {
            $texts[] = $list[$part] ?? $part;
        }
        return implode('、', $texts);
    }
}
