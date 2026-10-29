<?php

namespace app\admin\controller\group;

use app\admin\model\Group as GroupModel;
use app\common\controller\Backend;
use app\common\library\Auth;
use think\Db;

class Group extends Backend
{
    protected $relationSearch = true;
    protected $searchFields = 'id,name';

    protected $noNeedRight = ['forcestatus'];

    /**
     * @var GroupModel
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new GroupModel;
    }

    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->where($where)
                ->order($sort, $order)
                ->paginate($limit);
//            foreach ($list as $k => $v) {
//                $v->avatar = $v->avatar ? cdnurl($v->avatar, true) : letter_avatar($v->nickname);
//            }
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }


    /**
     * 修改强制状态（仅 Ajax POST）
     */
    public function forcestatus()
    {
        if (!$this->request->isPost()) {
            $this->error(__('Invalid parameters'));
        }
        $ids = (int)$this->request->post('ids', 0);
        if ($ids <= 0) {
            $this->error(__('Invalid parameters'));
        }
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $forceStatus = (int)$this->request->post('force_status', 0);
        if (!in_array($forceStatus, [0, 1], true)) {
            $this->error(__('Invalid parameters'));
        }
        Db::name('group')->where('id', $row['id'])->update([
            'force_status' => $forceStatus,
            'updated_at'   => date('Y-m-d H:i:s'),
        ]);
        $this->success(__('Operation completed'));
    }

    /**
     * 编辑
     */
    public function edit($ids = null)
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        $row = $this->model->get($ids);
        $this->modelValidate = true;
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        return parent::edit($ids);
    }

    /**
     * 删除
     */
    public function del($ids = "")
    {
        if (!$this->request->isPost()) {
            $this->error(__("Invalid parameters"));
        }
        $ids = $ids ? $ids : $this->request->post("ids");
        $row = $this->model->get($ids);
        $this->modelValidate = true;
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        Auth::instance()->delete($row['id']);
        $this->success();
    }
}