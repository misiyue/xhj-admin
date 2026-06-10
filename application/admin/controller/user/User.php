<?php

namespace app\admin\controller\user;

use app\admin\model\Users;
use app\common\controller\Backend;
use fast\Random;
use think\Db;
use think\Validate;

/**
 * 会员管理
 *
 * @icon fa fa-user
 */
class User extends Backend
{

    protected $relationSearch = true;
    protected $searchFields = 'id,username,nickname';

    /**
     * @var Users
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new Users;
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
            foreach ($list as $k => $v) {
                $v->avatar = $v->avatar ? cdnurl($v->avatar, true) : letter_avatar($v->nickname);
                $v->hidden(['password', 'salt']);
            }
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
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
     * 详情
     *
     * @param string|null $ids
     * @return mixed
     */
    public function detail($ids = null)
    {
        $ids = $ids !== null && $ids !== '' ? $ids : $this->request->param('ids');
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }

        if ($this->request->isPost()) {
            $this->token();
            $action = $this->request->post('action', '');
            if ($action === 'status') {
                $status = (int)$this->request->post('status');
                if (!in_array($status, [1, 2], true)) {
                    $this->error(__('Invalid parameters'));
                }
                Db::name('users')->where('id', $row['id'])->update([
                    'status'     => $status,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
                $this->success(__('Status updated'));
            }
            if ($action === 'resetpassword') {
                $password = trim((string)$this->request->post('password', ''));
                if ($password === '') {
                    $this->error(__('Password required'));
                }
                if (!Validate::is($password, '\S{6,30}')) {
                    $this->error(__('Password must be 6 to 30 characters'));
                }
                $salt = $row['salt'] ?: Random::alnum(16);
                $encrypted = md5($salt . $password . $salt);
                Db::name('users')->where('id', $row['id'])->update([
                    'password'   => $encrypted,
                    'salt'       => $salt,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
                $this->success(__('Password reset success'));
            }
            $this->error(__('Invalid parameters'));
        }

        $data = $row->toArray();
        $data['avatar'] = $data['avatar'] ? cdnurl($data['avatar'], true) : letter_avatar($data['nickname']);
        $genderList = $this->model->getGenderList();
        $data['gender_text'] = isset($genderList[(string)$data['gender']]) ? $genderList[(string)$data['gender']] : '-';
        $statusList = [1 => __('Normal'), 2 => __('Banned')];
        $data['status_text'] = $statusList[(int)$data['status']] ?? '-';
        $robotList = [1 => __('Yes'), 2 => __('No')];
        $data['is_robot_text'] = $robotList[(int)$data['is_robot']] ?? '-';

        $this->view->assign('row', $data);
        return $this->view->fetch();
    }

}
