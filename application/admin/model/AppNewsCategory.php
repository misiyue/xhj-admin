<?php

namespace app\admin\model;

use think\Model;

/**
 * 资讯分类
 */
class AppNewsCategory extends Model
{
    protected $name = 'app_news_category';

    protected $autoWriteTimestamp = false;

    public static function getCollectList()
    {
        return [
            'news' => __('Collect news'),
        ];
    }

    public static function getStatusList()
    {
        return [
            1 => __('Yes'),
            0 => __('No'),
        ];
    }

    /**
     * 获取指定项目下的分类下拉 [id => title]
     *
     * @param string $collect
     * @return array
     */
    public static function getSelectList($collect = 'news')
    {
        $rows = self::where('collect', $collect)
            ->order('sort', 'desc')
            ->order('id', 'desc')
            ->column('title', 'id');
        return $rows ?: [];
    }

    public function setSortAttr($value)
    {
        if ($value === '' || $value === null) {
            return 0;
        }
        return (int)$value;
    }
}
