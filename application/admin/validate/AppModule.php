<?php

namespace app\admin\validate;

use think\Validate;

class AppModule extends Validate
{
    protected $rule = [
        'code'    => 'require|max:255',
        'title'   => 'require|max:255',
        'is_open' => 'require|in:0,1',
    ];

    protected $scene = [
        'add'  => ['code', 'title', 'is_open'],
        'edit' => ['code', 'title', 'is_open'],
    ];
}
