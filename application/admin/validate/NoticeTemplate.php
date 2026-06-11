<?php

namespace app\admin\validate;

use think\Validate;

class NoticeTemplate extends Validate
{
    protected $rule = [
        'title'    => 'max:255',
        'subtitle' => 'max:255',
        'content'  => 'max:255',
    ];

    protected $scene = [
        'edit' => ['title', 'subtitle', 'content'],
    ];
}
