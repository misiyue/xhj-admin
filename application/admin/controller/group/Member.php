<?php

namespace app\admin\controller\group;

use app\admin\model\GroupMember;
use app\common\controller\Backend;

class Member extends Backend
{
    protected $relationSearch = true;
//    protected $searchFields = 'id,username,group_id';

    /**
     * @var GroupMember
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new GroupMember;
    }
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
                ->where('group_member.group_id','=',$this->request->get('group_id'))
                ->join('users u', 'u.id = group_member.user_id','left')
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
}