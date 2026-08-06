<?php

namespace app\admin\controller\content;

use app\admin\model\AppNews as AppNewsModel;
use app\common\controller\Backend;

/**
 * 火箭资讯
 *
 * @icon fa fa-newspaper-o
 */
class News extends Backend
{
    /**
     * @var AppNewsModel
     */
    protected $model = null;

    protected $searchFields = 'id,title,source_url';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    protected $multiFields = 'status';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new AppNewsModel;

        $collectTypeList = AppNewsModel::getCollectTypeList();
        $newsTypeList = AppNewsModel::getNewsTypeList();
        $sourceList = AppNewsModel::getSourceList();
        $statusList = AppNewsModel::getStatusList();

        $this->view->assign('collectTypeList', $collectTypeList);
        $this->view->assign('newsTypeList', $newsTypeList);
        $this->view->assign('sourceList', $sourceList);
        $this->view->assign('statusList', $statusList);

        $this->assignconfig('collectTypeList', $collectTypeList);
        $this->assignconfig('newsTypeList', $newsTypeList);
        $this->assignconfig('sourceList', $sourceList);
        $this->assignconfig('statusList', $statusList);
        // 确保富文本编辑器配置存在（插件未注入时兜底）
        $this->assignconfig('simditor', [
            'classname'          => '.editor',
            'height'             => '300',
            'minHeight'          => 250,
            'toolbarFloat'       => 0,
            'toolbar'            => ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'],
            'mobileToolbar'      => ['bold', 'underline', 'strikethrough', 'color', 'ul', 'ol'],
            'placeholder'        => '',
            'isdompurify'        => 0,
            'allowiframeprefixs' => [],
        ]);
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
