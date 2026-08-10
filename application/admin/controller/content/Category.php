<?php

namespace app\admin\controller\content;

use app\admin\model\AppNewsCategory as AppNewsCategoryModel;
use app\common\controller\Backend;

/**
 * 资讯分类
 *
 * @icon fa fa-folder-o
 */
class Category extends Backend
{
    /**
     * @var AppNewsCategoryModel
     */
    protected $model = null;

    protected $searchFields = 'id,title,collect';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    protected $multiFields = 'status';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new AppNewsCategoryModel;
        $collectList = AppNewsCategoryModel::getCollectList();
        $statusList = AppNewsCategoryModel::getStatusList();
        $this->view->assign('collectList', $collectList);
        $this->view->assign('statusList', $statusList);
        $this->assignconfig('collectList', $collectList);
        $this->assignconfig('statusList', $statusList);
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
