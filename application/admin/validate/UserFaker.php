<?php

namespace app\admin\validate;

use think\Validate;

class UserFaker extends Validate
{
    /**
     * 验证规则
     */
    protected $rule = [
        'user_id'  => 'number',
        'username' => 'max:255',
        'nickname' => 'max:255',
        'avatar'   => 'max:255',
    ];

    /**
     * 提示消息
     */
    protected $message = [
    ];

    /**
     * 验证场景
     */
    protected $scene = [
        'add'  => ['user_id', 'username', 'nickname', 'avatar'],
        'edit' => ['user_id', 'username', 'nickname', 'avatar'],
    ];

    public function __construct(array $rules = [], $message = [], $field = [])
    {
        $this->field = [
            'user_id'  => __('User_id'),
            'username' => __('Username'),
            'nickname' => __('Nickname'),
            'avatar'   => __('Avatar'),
        ];
        parent::__construct($rules, $message, $field);
    }
}
