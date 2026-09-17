<?php

namespace app\admin\controller\group;

use app\common\controller\Backend;
use app\common\library\OssStorage;
use think\Config;

/**
 * 群置顶推广位
 *
 * @icon fa fa-thumb-tack
 */
class Totop extends Backend
{
    /**
     * @var \app\admin\model\GroupTotop
     */
    protected $model = null;

    protected $searchFields = 'id,intro,btn,url,group_ids';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    protected $noNeedRight = ['uploadOssImage'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\GroupTotop;
    }

    /**
     * 封面上传至 OSS
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
            $result = $oss->uploadImage($file, 'group/totop');
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
