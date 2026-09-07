<?php

namespace app\admin\controller\group;

use app\admin\model\GroupFaker as GroupFakerModel;
use app\common\controller\Backend;
use think\Db;

/**
 * 群虚拟成员管理
 *
 * @icon fa fa-user-secret
 */
class Faker extends Backend
{
    /**
     * @var GroupFakerModel
     */
    protected $model = null;

    protected $searchFields = 'uf.username,uf.nickname,gf.faker_id';

    /**
     * 无需单独授权的节点
     */
    protected $noNeedRight = ['preview'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\GroupFaker;
    }

    /**
     * 根据 faker_id 预览假人名片
     */
    public function preview()
    {
        $fakerId = (int)$this->request->param('faker_id', 0);
        $groupId = (int)$this->request->param('group_id', 0);
        if ($fakerId <= 0) {
            $this->error(__('请输入有效的假人ID'));
        }

        $row = Db::name('user_faker')->where('id', $fakerId)->find();
        if (!$row) {
            $this->error(__('未找到该假人'));
        }

        $avatar = (string)($row['avatar'] ?? '');
        if ($avatar !== '' && !preg_match("/^(http:\/\/|https:\/\/|\/\/)/i", $avatar)) {
            $avatar = cdnurl($avatar, true);
        }

        $existsInGroup = false;
        if ($groupId > 0) {
            $existsInGroup = (bool)Db::name('group_faker')
                ->where('group_id', $groupId)
                ->where('faker_id', $fakerId)
                ->find();
        }

        $this->success('', null, [
            'id'              => (int)$row['id'],
            'user_id'         => $row['user_id'] ?? null,
            'username'        => $row['username'] ?? '',
            'nickname'        => $row['nickname'] ?? '',
            'avatar'          => $avatar,
            'exists_in_group' => $existsInGroup,
        ]);
    }

    /**
     * 虚拟成员列表
     */
    public function index()
    {
        $groupId = (int)$this->request->param('group_id', 0);
        $this->assignconfig('group_id', $groupId);

        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $query = Db::name('group_faker')
                ->alias('gf')
                ->join('user_faker uf', 'uf.id = gf.faker_id', 'left')
                ->where('gf.group_id', $groupId)
                ->where($where);

            $total = (clone $query)->count();

            $sortField = $sort ?: 'gf.faker_id';
            $sortOrder = $order ?: 'DESC';

            $list = $query
                ->field('gf.faker_id as id, gf.faker_id, gf.group_id, uf.username, uf.nickname, uf.avatar, uf.created_at as faker_created_at')
                ->order($sortField, $sortOrder)
                ->limit($offset, $limit)
                ->select();

            foreach ($list as &$item) {
                if (!empty($item['avatar']) && !preg_match("/^(http:\/\/|https:\/\/|\/\/)/i", $item['avatar'])) {
                    $item['avatar'] = cdnurl($item['avatar'], true);
                }
            }
            unset($item);

            return json(['total' => $total, 'rows' => $list]);
        }

        $group = Db::name('group')->where('id', $groupId)->find();
        $this->view->assign('group', $group);
        $this->view->assign('group_id', $groupId);
        return $this->view->fetch();
    }

    /**
     * 添加虚拟成员
     */
    public function add()
    {
        $groupId = (int)$this->request->param('group_id', 0);
        if ($this->request->isPost()) {
            $this->token();
            $params = $this->request->post('row/a', []);
            $groupId = (int)($params['group_id'] ?? $groupId);
            $fakerId = (int)($params['faker_id'] ?? 0);

            if ($groupId <= 0) {
                $this->error(__('群组不存在'));
            }
            if ($fakerId <= 0) {
                $this->error(__('请输入有效的假人ID'));
            }

            $faker = Db::name('user_faker')->where('id', $fakerId)->find();
            if (!$faker) {
                $this->error(__('未找到该假人'));
            }

            $exists = Db::name('group_faker')
                ->where('group_id', $groupId)
                ->where('faker_id', $fakerId)
                ->find();
            if ($exists) {
                $this->error(__('该假人已是当前群虚拟成员'));
            }

            Db::name('group_faker')->insert([
                'group_id' => $groupId,
                'faker_id' => $fakerId,
            ]);
            $this->success(__('添加成功'));
        }

        $this->assignconfig('group_id', $groupId);
        $group = Db::name('group')->where('id', $groupId)->find();
        $this->view->assign('group', $group);
        $this->view->assign('group_id', $groupId);
        return $this->view->fetch();
    }

    /**
     * 移除虚拟成员
     */
    public function del($ids = "")
    {
        if (!$this->request->isPost()) {
            $this->error(__('Invalid parameters'));
        }
        $ids = $ids !== '' ? $ids : $this->request->post('ids');
        $groupId = (int)$this->request->param('group_id', 0);

        if (empty($ids) || $groupId <= 0) {
            $this->error(__('Invalid parameters'));
        }

        $idArr = is_array($ids) ? $ids : explode(',', (string)$ids);
        $idArr = array_unique(array_filter(array_map('intval', $idArr)));
        if (empty($idArr)) {
            $this->error(__('Invalid parameters'));
        }

        $count = Db::name('group_faker')
            ->where('group_id', $groupId)
            ->whereIn('faker_id', $idArr)
            ->delete();

        if ($count) {
            $this->success(__('移除成功'));
        } else {
            $this->error(__('未找到要删除的记录'));
        }
    }
}
