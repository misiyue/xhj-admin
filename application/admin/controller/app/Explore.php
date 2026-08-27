<?php

namespace app\admin\controller\app;

use app\admin\model\AppExplore;
use app\common\controller\Backend;

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
