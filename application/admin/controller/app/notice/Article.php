<?php

namespace app\admin\controller\app\notice;

use app\admin\model\NoticeArticle as NoticeArticleModel;
use app\common\controller\Backend;

/**
 * 通知文章
 *
 * @icon fa fa-file-text
 */
class Article extends Backend
{
    /**
     * @var NoticeArticleModel
     */
    protected $model = null;

    protected $searchFields = 'id,code,title,content';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    protected $multiFields = 'status';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new NoticeArticleModel;
        $statusList = NoticeArticleModel::getStatusList();
        $this->view->assign('statusList', $statusList);
        $this->assignconfig('statusList', $statusList);
        if (empty($this->view->config['simditor'])) {
            $this->assignconfig('simditor', [
                'classname'          => '.editor',
                'height'             => '250',
                'minHeight'          => 250,
                'toolbarFloat'       => 0,
                'toolbar'            => ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'],
                'mobileToolbar'      => ['bold', 'underline', 'strikethrough', 'color', 'ul', 'ol'],
                'placeholder'        => '',
                'isdompurify'        => 0,
                'allowiframeprefixs' => [],
            ]);
        }
    }

    /**
     * 查看
     */
    public function index()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);
            foreach ($list as $item) {
                $item->content = mb_substr(strip_tags((string)$item->content), 0, 200);
            }
            $result = ['total' => $list->total(), 'rows' => $list->items()];
            return json($result);
        }
        return $this->view->fetch();
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
