<?php

namespace app\admin\validate;

use think\Validate;

class AppNews extends Validate
{
    protected $rule = [
        'title'       => 'require|max:255',
        'category_id' => 'require|integer|gt:0',
        'type_id'     => 'require|in:1,2',
        'cover'       => 'max:255',
        'source_url'  => 'max:512',
        'status'      => 'require|in:0,1,-1',
    ];

    protected $scene = [
        'add'  => ['title', 'category_id', 'type_id', 'cover', 'source_url', 'status'],
        'edit' => ['title', 'category_id', 'type_id', 'cover', 'source_url', 'status'],
    ];
}
