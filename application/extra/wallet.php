<?php

use think\Env;

return [
    'baseurl' => trim((string)Env::get('wallet.baseurl', '')),
    'key'     => trim((string)Env::get('wallet.key', '')),
];
