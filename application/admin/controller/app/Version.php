<?php

namespace app\admin\controller\app;

use app\admin\model\AppVersion;
use app\common\controller\Backend;

/**
 * APP 版本记录
 *
 * @icon fa fa-mobile
 */
class Version extends Backend
{
    /**
     * @var AppVersion
     */
    protected $model = null;

    protected $searchFields = 'id,platform,channel,latest_version_name,title';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new AppVersion;
        $this->view->assign('platformList', AppVersion::getPlatformList());
        $this->view->assign('upgradeTypeList', AppVersion::getUpgradeTypeList());
        $this->assignconfig('platformList', AppVersion::getPlatformList());
        $this->assignconfig('upgradeTypeList', AppVersion::getUpgradeTypeList());
    }

    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        return parent::add();
    }

    /**
     * 编辑页：JSON 字段格式化为可读文本
     *
     * @param string|null $ids
     * @return mixed
     */
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
        $data['release_notes'] = AppVersion::formatJsonForTextarea($row['release_notes'] ?? null);
        $data['download_urls'] = AppVersion::formatJsonForTextarea($row['download_urls'] ?? null);
        $this->view->assign('row', $data);
        return $this->view->fetch();
    }
}
