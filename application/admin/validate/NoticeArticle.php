<?php

namespace app\admin\validate;

use think\Validate;

class NoticeArticle extends Validate
{
    protected $rule = [
        'title'   => 'max:64',
        'content' => 'require',
        'status'  => 'require|in:0,1',
    ];

    protected $scene = [
        'add'  => ['title', 'content', 'status'],
        'edit' => ['title', 'content', 'status'],
    ];
}
