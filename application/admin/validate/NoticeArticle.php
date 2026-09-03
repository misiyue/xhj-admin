<?php

namespace app\admin\validate;

use think\Validate;

class NoticeArticle extends Validate
{
    protected $rule = [
        'code'      => 'require|max:32|unique:notice_article,code',
        'title'     => 'max:64',
        'content'   => 'checkContent',
        'text_type' => 'require|in:1,2',
        'status'    => 'in:0,1',
    ];

    protected $scene = [
        'add'  => ['code', 'title', 'content', 'text_type', 'status'],
        'edit' => ['code', 'title', 'content', 'text_type', 'status'],
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
