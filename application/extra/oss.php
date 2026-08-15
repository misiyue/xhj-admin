<?php

use think\Env;

return [
    'access_key_id'           => trim(Env::get('oss.access_key_id', ''), " \t\n\r\0\x0B\"'"),
    'access_secret'           => trim(Env::get('oss.access_secret', ''), " \t\n\r\0\x0B\"'"),
    'bucket_public'           => trim(Env::get('oss.bucket_public', ''), " \t\n\r\0\x0B\"'"),
    'bucket_private'          => trim(Env::get('oss.bucket_private', ''), " \t\n\r\0\x0B\"'"),
    'endpoint'                => trim(Env::get('oss.endpoint', ''), " \t\n\r\0\x0B\"'"),
    'ssl'                     => (bool)Env::get('oss.ssl', true),
    'oss_domain'              => trim(Env::get('oss.oss_domain', ''), " \t\n\r\0\x0B\"'"),
    'oss_domain_ssl_enabled'  => (bool)Env::get('oss.oss_domain_ssl_enabled', true),
    'replace_domain_enabled'  => (bool)Env::get('oss.replace_domain_enabled', true),
];
