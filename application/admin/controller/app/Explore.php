<?php

namespace app\admin\controller\app;

use app\admin\model\AppExplore;
use app\common\controller\Backend;
use app\common\library\OssStorage;
use think\Config;

/**
 * 探索位管理
 *
 * @icon fa fa-compass
 */
class Explore extends Backend
{
    /**
     * @var AppExplore
     */
    protected $model = null;

    protected $searchFields = 'id,title,url,position,sort';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    protected $noNeedRight = ['uploadOssImage'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new AppExplore;
        $endsList = AppExplore::getEndsList();
        $this->view->assign('endsList', $endsList);
        $this->assignconfig('endsList', $endsList);
        $posList = AppExplore::getPositionList();
        $this->view->assign('positionList', $posList);
        $this->assignconfig('positionList', $posList);
        $this->assignconfig('exploreOss', [
            'imageUploadUrl' => url('app/explore/uploadOssImage'),
        ]);
    }

    /**
     * 探索位图片上传至 OSS
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
            $result = $oss->uploadImage($file, 'explore/image');
            return json([
                'code' => 1,
                'msg'  => __('Uploaded successful'),
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            $this->error($e->getMessage());
        }
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        return parent::add();
    }

    public function edit($ids = null)
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        return parent::edit($ids);
    }
}
