<?php

namespace app\admin\validate;

use think\Validate;

class AppModule extends Validate
{
    protected $rule = [
        'code'  => 'require|max:32',
        'title' => 'require|max:32',
        'ends'  => 'max:32',
    ];

    protected $scene = [
        'add'  => ['code', 'title', 'ends'],
        'edit' => ['code', 'title', 'ends'],
    ];
}
