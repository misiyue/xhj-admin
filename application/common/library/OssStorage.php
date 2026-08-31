<?php

namespace app\common\library;

use think\Config;
use think\File;

/**
 * 阿里云 OSS 上传（REST + 签名）
 */
class OssStorage
{
    /** @var array */
    protected $config;

    public function __construct()
    {
        $this->config = Config::get('oss') ?: [];
    }

    /**
     * @param File $file
     * @return array{url:string,fullurl:string,path:string}
     * @throws \Exception
     */
    public function uploadImage(File $file, $dir = 'upload/image')
    {
        $info = $file->getInfo();
        $suffix = strtolower(pathinfo($info['name'], PATHINFO_EXTENSION));
        $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        if (!in_array($suffix, $allowedExt, true)) {
            throw new \Exception('仅支持上传 jpg、png、gif、webp、bmp 图片');
        }

        $mime = $this->detectMime($file->getRealPath() ?: $info['tmp_name']);
        if (strpos($mime, 'image/') !== 0) {
            throw new \Exception('文件不是有效的图片');
        }
        if (@getimagesize($info['tmp_name']) === false) {
            throw new \Exception('图片文件无效或已损坏');
        }

        return $this->putObject($file->getRealPath() ?: $info['tmp_name'], $suffix, $mime, $dir);
    }

    /**
     * @param File $file
     * @param int   $maxBytes
     * @return array{url:string,fullurl:string,path:string}
     * @throws \Exception
     */
    public function uploadVideo(File $file, $maxBytes = 209715200)
    {
        $info = $file->getInfo();
        if ($info['size'] > $maxBytes) {
            throw new \Exception('视频文件过大，最大允许 ' . round($maxBytes / 1048576) . 'MB');
        }

        $suffix = strtolower(pathinfo($info['name'], PATHINFO_EXTENSION));
        $allowedExt = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', '3gp'];
        if (!in_array($suffix, $allowedExt, true)) {
            throw new \Exception('仅支持上传 mp4、webm、mov、avi、mkv、m4v、3gp 视频');
        }

        $mime = $this->detectMime($file->getRealPath() ?: $info['tmp_name']);
        $allowedMimePrefix = ['video/'];
        $valid = false;
        foreach ($allowedMimePrefix as $prefix) {
            if (strpos($mime, $prefix) === 0) {
                $valid = true;
                break;
            }
        }
        if (!$valid) {
            throw new \Exception('文件不是有效的视频');
        }

        return $this->putObject($file->getRealPath() ?: $info['tmp_name'], $suffix, $mime, 'news/video');
    }

    /**
     * @param string $localPath
     * @param string $suffix
     * @param string $mime
     * @param string $dir
     * @return array{url:string,fullurl:string,path:string}
     * @throws \Exception
     */
    protected function putObject($localPath, $suffix, $mime, $dir)
    {
        $accessKeyId = $this->config['access_key_id'] ?? '';
        $accessSecret = $this->config['access_secret'] ?? '';
        $bucket = $this->config['bucket_public'] ?? '';
        $endpoint = $this->config['endpoint'] ?? '';

        if ($accessKeyId === '' || $accessSecret === '' || $bucket === '' || $endpoint === '') {
            throw new \Exception('OSS 配置不完整，请检查 .env [oss] 配置');
        }

        if (!is_file($localPath)) {
            throw new \Exception('上传文件不存在');
        }

        $objectKey = trim($dir, '/') . '/' . date('Ymd') . '/' . md5(uniqid((string)mt_rand(), true)) . '.' . $suffix;
        $objectKey = str_replace('//', '/', $objectKey);

        $content = file_get_contents($localPath);
        if ($content === false) {
            throw new \Exception('读取上传文件失败');
        }

        $date = gmdate('D, d M Y H:i:s') . ' GMT';
        $canonicalizedResource = '/' . $bucket . '/' . $objectKey;
        $stringToSign = "PUT\n\n{$mime}\n{$date}\n{$canonicalizedResource}";
        $signature = base64_encode(hash_hmac('sha1', $stringToSign, $accessSecret, true));
        $authorization = 'OSS ' . $accessKeyId . ':' . $signature;

        $ssl = !empty($this->config['ssl']);
        $host = $endpoint;
        $url = ($ssl ? 'https' : 'http') . '://' . $host . '/' . $objectKey;

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => 'PUT',
            CURLOPT_POSTFIELDS     => $content,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER         => true,
            CURLOPT_HTTPHEADER     => [
                'Date: ' . $date,
                'Content-Type: ' . $mime,
                'Authorization: ' . $authorization,
                'Content-Length: ' . strlen($content),
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_TIMEOUT        => 300,
        ]);

        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new \Exception('OSS 上传失败: ' . $curlError);
        }
        if ($httpCode !== 200) {
            throw new \Exception('OSS 上传失败，HTTP ' . $httpCode);
        }

        $publicUrl = $this->buildPublicUrl($objectKey);
        return [
            'path'    => $objectKey,
            'url'     => $publicUrl,
            'fullurl' => $publicUrl,
        ];
    }

    /**
     * @param string $objectKey
     * @return string
     */
    public function buildPublicUrl($objectKey)
    {
        $objectKey = ltrim($objectKey, '/');
        if (!empty($this->config['replace_domain_enabled']) && !empty($this->config['oss_domain'])) {
            $scheme = !empty($this->config['oss_domain_ssl_enabled']) ? 'https' : 'http';
            return $scheme . '://' . rtrim($this->config['oss_domain'], '/') . '/' . $objectKey;
        }
        $scheme = !empty($this->config['ssl']) ? 'https' : 'http';
        return $scheme . '://' . $this->config['endpoint'] . '/' . $objectKey;
    }

    /**
     * @param string $path
     * @return string
     */
    protected function detectMime($path)
    {
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $mime = finfo_file($finfo, $path);
                finfo_close($finfo);
                if ($mime) {
                    return $mime;
                }
            }
        }
        return 'application/octet-stream';
    }
}
