<?php

namespace app\admin\controller\content;

use app\admin\model\AppNews as AppNewsModel;
use app\admin\model\AppNewsCategory as AppNewsCategoryModel;
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

    protected $multiFields = 'status,is_index';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new AppNewsModel;

        $categoryList = AppNewsCategoryModel::getSelectList('news');
        $typeList = AppNewsModel::getTypeList();
        $statusList = AppNewsModel::getStatusList();
        $isIndexList = AppNewsModel::getIsIndexList();

        $this->view->assign('categoryList', $categoryList);
        $this->view->assign('typeList', $typeList);
        $this->view->assign('statusList', $statusList);
        $this->view->assign('isIndexList', $isIndexList);

        $this->assignconfig('categoryList', $categoryList);
        $this->assignconfig('typeList', $typeList);
        $this->assignconfig('statusList', $statusList);
        $this->assignconfig('isIndexList', $isIndexList);
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
            $categoryMap = AppNewsCategoryModel::where('collect', 'news')->column('title', 'id');
            $rows = [];
            foreach ($list->items() as $item) {
                $row = $item instanceof \think\Model ? $item->toArray() : (array)$item;
                $cid = (int)($row['category_id'] ?? 0);
                $row['category_text'] = $categoryMap[$cid] ?? '-';
                $rows[] = $row;
            }
            return json(['total' => $list->total(), 'rows' => $rows]);
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
