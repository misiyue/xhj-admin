<?php

namespace app\admin\validate;

use think\Validate;

class AppNewsCategory extends Validate
{
    protected $rule = [
        'title'   => 'require|max:255',
        'collect' => 'require|in:news',
        'status'  => 'require|in:0,1',
        'sort'    => 'integer|egt:0',
    ];

    protected $scene = [
        'add'  => ['title', 'collect', 'status', 'sort'],
        'edit' => ['title', 'collect', 'status', 'sort'],
    ];
}
