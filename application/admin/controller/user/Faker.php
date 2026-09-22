<?php

namespace app\admin\controller\user;

use app\admin\model\UserFaker as UserFakerModel;
use app\common\controller\Backend;
use app\common\library\OssStorage;
use think\Config;

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

    protected $noNeedRight = ['uploadOssImage'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\UserFaker;
    }

    /**
     * 头像上传至 OSS
     */
    public function uploadOssImage()
    {
        Config::set('default_return_type', 'json');
        $file = $this->request->file('file');
        if (!$file) {
            $this->error(__('No file upload or server upload limit exceeded'));
        }
        try {
            $oss = new OssStorage();
            $result = $oss->uploadImage($file, 'user/faker');
            return json([
                'code' => 1,
                'msg'  => __('Uploaded successful'),
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
