<?php

namespace app\admin\validate;

use think\Validate;

class AppNews extends Validate
{
    protected $rule = [
        'title'        => 'require|max:255',
        'collect_type' => 'require|in:image_text,video',
        'news_type'    => 'require|in:global_hot,crypto,realtime_hot',
        'source'       => 'require|in:youtube,twitter,nytimes,telegram',
        'cover'        => 'max:255',
        'source_url'   => 'max:512',
        'status'       => 'require|in:0,1,-1',
    ];

    protected $scene = [
        'add'  => ['title', 'collect_type', 'news_type', 'source', 'cover', 'source_url', 'status'],
        'edit' => ['title', 'collect_type', 'news_type', 'source', 'cover', 'source_url', 'status'],
    ];
}
