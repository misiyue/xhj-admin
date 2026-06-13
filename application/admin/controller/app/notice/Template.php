<?php

namespace app\admin\controller\app\notice;

use app\admin\model\NoticeTemplate as NoticeTemplateModel;
use app\common\controller\Backend;

/**
 * 通知模板
 *
 * @icon fa fa-bell
 */
class Template extends Backend
{
    /**
     * @var NoticeTemplateModel
     */
    protected $model = null;

    protected $searchFields = 'id,flag,title,subtitle,content';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    protected $excludeFields = 'flag';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new NoticeTemplateModel;
        $flagList = NoticeTemplateModel::getFlagList();
        $this->view->assign('flagList', $flagList);
        $this->assignconfig('flagList', $flagList);
    }

    /**
     * 禁止添加
     */
    public function add()
    {
        $this->error(__('Invalid parameters'));
    }

    public function edit($ids = null)
    {
        if ($this->request->isPost()) {
            $this->token();
            return parent::edit($ids);
        }
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds) && !in_array($row[$this->dataLimitField], $adminIds)) {
            $this->error(__('You have no permission'));
        }
        $data = $row->toArray();
        $data['flag_text'] = NoticeTemplateModel::getFlagText($data['flag'] ?? '');
        $this->view->assign('row', $data);
        return $this->view->fetch();
    }
}
