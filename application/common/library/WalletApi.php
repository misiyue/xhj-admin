<?php

namespace app\common\library;

use fast\Http;
use think\Config;
use think\Log;

/**
 * 钱包后台 API
 */
class WalletApi
{
    /**
     * 解冻保证金 order/unfreezeAccount
     *
     * @param int    $uid         用户 user_id
     * @param string $uUid        用户 uuid
     * @param string $amount      保证金金额
     * @param int    $currencyId  币种，默认 1
     * @return array{success:bool,message:string,raw:mixed}
     */
    public static function unfreezeAccount($uid, $uUid, $amount, $currencyId = 1)
    {
        $baseurl = Config::get('wallet.baseurl');
        $key = Config::get('wallet.key');
        if ($baseurl === '' || $key === '') {
            return ['success' => false, 'message' => __('Wallet api not configured'), 'raw' => null];
        }

        $url = rtrim($baseurl, '/') . '/order/unfreezeAccount';
        $params = [
            'uid'         => (int)$uid,
            'u_uid'       => (string)$uUid,
            'amount'      => (string)$amount,
            'currency_id' => (int)$currencyId,
            'key'         => $key,
        ];

        $req = Http::sendRequest($url, $params, 'POST');
        if (!$req['ret']) {
            $msg = isset($req['msg']) ? (string)$req['msg'] : __('Wallet api request failed');
            Log::write('unfreezeAccount curl error: ' . $msg, 'error');
            return ['success' => false, 'message' => $msg, 'raw' => $req];
        }

        $body = $req['msg'];
        $decoded = is_string($body) ? json_decode($body, true) : null;
        if (!is_array($decoded)) {
            Log::write('unfreezeAccount invalid response: ' . $body, 'error');
            return ['success' => false, 'message' => __('Wallet api invalid response'), 'raw' => $body];
        }

        if (self::isSuccessResponse($decoded)) {
            return ['success' => true, 'message' => '', 'raw' => $decoded];
        }

        $message = self::extractErrorMessage($decoded);
        Log::write('unfreezeAccount failed: ' . json_encode($decoded, JSON_UNESCAPED_UNICODE), 'error');
        return ['success' => false, 'message' => $message, 'raw' => $decoded];
    }

    /**
     * 接口约定：code 0-失败，1-成功
     */
    protected static function isSuccessResponse(array $decoded)
    {
        return isset($decoded['code']) && (int)$decoded['code'] === 1;
    }

    protected static function extractErrorMessage(array $decoded)
    {
        $msg = isset($decoded['msg']) ? trim((string)$decoded['msg']) : '';
        return $msg !== '' ? $msg : __('Wallet api unfreeze failed');
    }
}
