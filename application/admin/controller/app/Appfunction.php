<?php

namespace app\admin\controller\app;

use app\admin\model\AppFunction as AppFunctionModel;
use app\common\controller\Backend;

/**
 * App 功能管理
 *
 * 菜单规则：app/appfunction（function 为 PHP 保留字，不可作控制器类名）
 *
 * @icon fa fa-toggle-on
 */
class Appfunction extends Backend
{
    /**
     * @var AppFunctionModel
     */
    protected $model = null;

    protected $searchFields = 'id,code,title';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    protected $multiFields = 'is_open';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new AppFunctionModel;
        $isOpenList = AppFunctionModel::getIsOpenList();
        $this->view->assign('isOpenList', $isOpenList);
        $this->assignconfig('isOpenList', $isOpenList);
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
