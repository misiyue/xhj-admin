<?php

namespace app\admin\validate;

use think\Validate;

class AppVersion extends Validate
{
    protected $rule = [
        'platform'            => 'require|in:ios,android',
        'channel'             => 'require|length:1,50',
        'latest_version_name' => 'require|length:1,20',
        'upgrade_type'        => 'require|in:optional,force',
        'title'               => 'length:0,100',
        'release_notes'      => 'checkJsonArray',
        'download_urls'      => 'checkJsonStringArray',
        'published_at'       => 'require|date',
    ];

    protected $message = [];

    protected $scene = [
        'add'  => ['platform', 'channel', 'latest_version_name', 'upgrade_type', 'title', 'release_notes', 'download_urls', 'published_at'],
        'edit' => ['platform', 'channel', 'latest_version_name', 'upgrade_type', 'title', 'release_notes', 'download_urls', 'published_at'],
    ];

    protected function checkJsonArray($value, $rule, $data = [], $field = '', $title = '')
    {
        if ($value === null || $value === '') {
            return true;
        }
        if (!is_string($value)) {
            return __('Json must be array');
        }
        $value = trim($value);
        if ($value === '') {
            return true;
        }
        $decoded = json_decode($value, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return __('Invalid json');
        }
        if (!is_array($decoded)) {
            return __('Json must be array');
        }
        return true;
    }

    /**
     * 下载链接：须为 JSON 数组，且每个元素为字符串（一般为 URL）
     */
    protected function checkJsonStringArray($value, $rule, $data = [], $field = '', $title = '')
    {
        if ($value === null || $value === '') {
            return true;
        }
        if (!is_string($value)) {
            return __('Json must be string array');
        }
        $value = trim($value);
        if ($value === '') {
            return true;
        }
        $decoded = json_decode($value, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return __('Invalid json');
        }
        if (!is_array($decoded)) {
            return __('Json must be string array');
        }
        foreach ($decoded as $item) {
            if (!is_string($item)) {
                return __('Json must be string array');
            }
        }
        return true;
    }
}
