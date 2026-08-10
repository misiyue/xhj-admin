<?php

namespace app\common\library;

use think\Config;

/**
 * 从视频截取封面（首帧）
 */
class VideoCover
{
    /**
     * 截取视频第一帧并保存到 uploads，返回相对 URL
     *
     * @param string $videoUrl 视频地址（相对路径或完整 URL）
     * @return string 成功返回封面相对路径，失败返回空字符串
     */
    public static function capture($videoUrl)
    {
        $videoUrl = trim((string)$videoUrl);
        if ($videoUrl === '') {
            return '';
        }

        $ffmpeg = self::findFfmpeg();
        if ($ffmpeg === '') {
            return '';
        }

        $tempFile = null;
        $localPath = self::resolveLocalPath($videoUrl);
        if (!$localPath) {
            $tempFile = self::downloadTemp($videoUrl);
            $localPath = $tempFile;
        }
        if (!$localPath || !is_file($localPath)) {
            return '';
        }

        try {
            return self::extractWithFfmpeg($ffmpeg, $localPath);
        } finally {
            if ($tempFile && is_file($tempFile)) {
                @unlink($tempFile);
            }
        }
    }

    /**
     * 解析为本地可读路径
     *
     * @param string $videoUrl
     * @return string
     */
    protected static function resolveLocalPath($videoUrl)
    {
        $path = $videoUrl;
        if (preg_match('#^https?://#i', $path)) {
            $cdnurl = (string)Config::get('upload.cdnurl');
            $siteurl = (string)Config::get('site.cdnurl');
            foreach (array_filter([$cdnurl, $siteurl, request()->domain()]) as $prefix) {
                $prefix = rtrim($prefix, '/');
                if ($prefix !== '' && stripos($path, $prefix) === 0) {
                    $path = substr($path, strlen($prefix));
                    break;
                }
            }
            // 仍是完整 URL，说明是外链，交由下载处理
            if (preg_match('#^https?://#i', $path)) {
                return '';
            }
        }

        $path = '/' . ltrim(parse_url($path, PHP_URL_PATH) ?: $path, '/');
        $publicRoot = ROOT_PATH . 'public';
        $candidates = [
            $publicRoot . str_replace('/', DS, $path),
            $publicRoot . DS . 'uploads' . str_replace('/', DS, preg_replace('#^/uploads#', '', $path)),
        ];
        foreach ($candidates as $file) {
            if (is_file($file)) {
                return $file;
            }
        }
        return '';
    }

    /**
     * 下载远程视频到临时文件
     *
     * @param string $videoUrl
     * @return string
     */
    protected static function downloadTemp($videoUrl)
    {
        if (!preg_match('#^https?://#i', $videoUrl)) {
            return '';
        }
        $ext = strtolower(pathinfo(parse_url($videoUrl, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION));
        if (!in_array($ext, ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'], true)) {
            $ext = 'mp4';
        }
        $temp = tempnam(sys_get_temp_dir(), 'vcov_');
        if ($temp === false) {
            return '';
        }
        $target = $temp . '.' . $ext;
        @unlink($temp);

        $ctx = stream_context_create([
            'http' => [
                'timeout'         => 30,
                'follow_location' => 1,
                'user_agent'      => 'Mozilla/5.0 (compatible; VideoCover/1.0)',
            ],
            'ssl'  => [
                'verify_peer'      => false,
                'verify_peer_name' => false,
            ],
        ]);
        $data = @file_get_contents($videoUrl, false, $ctx);
        if ($data === false || $data === '') {
            return '';
        }
        if (@file_put_contents($target, $data) === false) {
            return '';
        }
        return $target;
    }

    /**
     * @param string $ffmpeg
     * @param string $localPath
     * @return string
     */
    protected static function extractWithFfmpeg($ffmpeg, $localPath)
    {
        $subdir = date('Ymd');
        $dir = ROOT_PATH . 'public' . DS . 'uploads' . DS . $subdir;
        if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
            return '';
        }

        $filename = md5(uniqid((string)mt_rand(), true)) . '.jpg';
        $destAbs = $dir . DS . $filename;
        $destUrl = '/uploads/' . $subdir . '/' . $filename;

        $cmd = sprintf(
            '%s -y -ss 0 -i %s -frames:v 1 -q:v 2 %s 2>&1',
            self::escapeCmd($ffmpeg),
            escapeshellarg($localPath),
            escapeshellarg($destAbs)
        );

        $output = [];
        $code = 1;
        @exec($cmd, $output, $code);
        if ($code !== 0 || !is_file($destAbs) || filesize($destAbs) < 32) {
            if (is_file($destAbs)) {
                @unlink($destAbs);
            }
            return '';
        }
        return $destUrl;
    }

    /**
     * @return string
     */
    protected static function findFfmpeg()
    {
        $configured = Config::get('site.ffmpeg');
        if (is_string($configured) && $configured !== '') {
            if (is_file($configured) || self::commandExists($configured)) {
                return $configured;
            }
        }
        foreach (['ffmpeg', 'ffmpeg.exe'] as $bin) {
            if (self::commandExists($bin)) {
                return $bin;
            }
        }
        return '';
    }

    /**
     * @param string $bin
     * @return bool
     */
    protected static function commandExists($bin)
    {
        $isWin = stripos(PHP_OS, 'WIN') === 0;
        $check = $isWin ? 'where' : 'which';
        $cmd = $check . ' ' . escapeshellarg($bin);
        $output = [];
        $code = 1;
        @exec($cmd, $output, $code);
        return $code === 0 && !empty($output);
    }

    /**
     * @param string $bin
     * @return string
     */
    protected static function escapeCmd($bin)
    {
        if (is_file($bin) || strpos($bin, ' ') !== false || strpos($bin, '\\') !== false || strpos($bin, '/') !== false) {
            return escapeshellarg($bin);
        }
        return $bin;
    }
}
