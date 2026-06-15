<?php

namespace app\admin\validate;

use think\Validate;

class NoticeArticle extends Validate
{
    protected $rule = [
        'title'   => 'max:64',
        'content' => 'checkContent',
        'status'  => 'in:0,1',
    ];

    protected $scene = [
        'add'  => ['title', 'content', 'status'],
        'edit' => ['title', 'content', 'status'],
    ];

    protected function checkContent($value, $rule, $data = [], $field = '', $title = '')
    {
        $text = trim(strip_tags(html_entity_decode((string)$value, ENT_QUOTES, 'UTF-8')));
        if ($text === '') {
            return __('Content required');
        }
        return true;
    }
}
