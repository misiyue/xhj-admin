<?php

namespace app\admin\validate;

use think\Validate;

class GroupTotop extends Validate
{
    protected $rule = [
        'title'     => 'max:255',
        'cover'     => 'max:255',
        'intro'     => 'max:255',
        'btn'       => 'max:255',
        'url'       => 'max:255',
        'group_ids' => 'max:255',
        'sort'      => 'integer|between:0,99999999',
    ];

    protected $message = [
    ];

    protected $scene = [
        'add'  => ['title', 'cover', 'intro', 'btn', 'url', 'group_ids', 'sort'],
        'edit' => ['title', 'cover', 'intro', 'btn', 'url', 'group_ids', 'sort'],
    ];

    public function __construct(array $rules = [], $message = [], $field = [])
    {
        $this->field = [
            'title'     => __('Title'),
            'cover'     => __('Cover'),
            'intro'     => __('Intro'),
            'btn'       => __('Btn'),
            'url'       => __('Url'),
            'group_ids' => __('Group_ids'),
            'sort'      => __('Sort'),
        ];
        parent::__construct($rules, $message, $field);
    }
}
