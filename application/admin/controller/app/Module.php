<?php

namespace app\admin\controller\app;

use app\admin\model\AppModule as AppModuleModel;
use app\common\controller\Backend;

/**
 * App 模块管理
 *
 * @icon fa fa-toggle-on
 */
class Module extends Backend
{
    /**
     * @var AppModuleModel
     */
    protected $model = null;

    protected $searchFields = 'id,code,title';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new AppModuleModel;
        $endsList = AppModuleModel::getEndsList();
        $this->view->assign('endsList', $endsList);
        $this->assignconfig('endsList', $endsList);
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
