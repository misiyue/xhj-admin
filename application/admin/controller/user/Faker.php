<?php

namespace app\admin\controller\user;

use app\admin\model\UserFaker as UserFakerModel;
use app\common\controller\Backend;

/**
 * 假人管理
 *
 * @icon fa fa-user-secret
 */
class Faker extends Backend
{
    /**
     * @var UserFakerModel
     */
    protected $model = null;

    protected $searchFields = 'id,user_id,username,nickname';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\UserFaker;
    }
}
