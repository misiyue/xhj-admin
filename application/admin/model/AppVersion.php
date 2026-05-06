<?php

namespace app\admin\model;

use think\Model;
use think\exception\ValidateException;

/**
 * APP 版本发布记录
 */
class AppVersion extends Model
{
    protected $name = 'app_version';
    

    public static function getPlatformList()
    {
        return [
            'ios'     => __('Ios'),
            'android' => __('Android'),
        ];
    }

    public static function getUpgradeTypeList()
    {
        return [
            'optional' => __('Optional upgrade'),
            'force'    => __('Force upgrade'),
        ];
    }

    /**
     * 将 JSON 字段格式化为表单 textarea 展示
     *
     * @param mixed $value
     * @return string
     */
    public static function formatJsonForTextarea($value)
    {
        if ($value === null || $value === '') {
            return '';
        }
        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            }
        }
        return (string)$value;
    }

    public function setReleaseNotesAttr($value)
    {
        return self::normalizeJsonColumn($value);
    }

    public function setDownloadUrlsAttr($value)
    {
        return self::normalizeJsonStringArrayColumn($value);
    }

    /**
     * 下载链接：JSON 字符串数组，如 ["https://a.apk","https://b.ipa"]
     *
     * @param mixed $value
     * @return string|null
     */
    protected static function normalizeJsonStringArrayColumn($value)
    {
        if ($value === null) {
            return null;
        }
        if (is_string($value)) {
            $value = trim($value);
            if ($value === '') {
                return null;
            }
            $decoded = json_decode($value, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
                throw new ValidateException(__('Json must be string array'));
            }
            $urls = [];
            foreach ($decoded as $item) {
                if (!is_string($item)) {
                    throw new ValidateException(__('Json must be string array'));
                }
                $urls[] = $item;
            }
            return json_encode(array_values($urls), JSON_UNESCAPED_UNICODE);
        }
        if (is_array($value)) {
            foreach ($value as $item) {
                if (!is_string($item)) {
                    throw new ValidateException(__('Json must be string array'));
                }
            }
            return json_encode(array_values($value), JSON_UNESCAPED_UNICODE);
        }
        throw new ValidateException(__('Json must be string array'));
    }

    /**
     * @param mixed $value
     * @return string|null MySQL JSON 列写入合法 JSON 文本
     */
    protected static function normalizeJsonColumn($value)
    {
        if ($value === null) {
            return null;
        }
        if (is_string($value)) {
            $value = trim($value);
            if ($value === '') {
                return null;
            }
            $decoded = json_decode($value, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
                throw new ValidateException(__('Json must be array'));
            }
            return json_encode($decoded, JSON_UNESCAPED_UNICODE);
        }
        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }
        throw new ValidateException(__('Json must be array'));
    }
}
