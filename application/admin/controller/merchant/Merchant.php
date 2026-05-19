<?php

namespace app\admin\controller\merchant;

use app\admin\model\Merchant as MerchantModel;
use app\common\controller\Backend;

/**
 * 商户管理
 *
 * @icon fa fa-building
 */
class Merchant extends Backend
{
    /**
     * @var MerchantModel
     */
    protected $model = null;

    protected $searchFields = 'id,nickname,user_id';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new MerchantModel;
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
                ->where('status', 1)
                ->order($sort, $order)
                ->paginate($limit);
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 待审核商户列表（弹窗）
     */
    public function auditlist()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->where($where)
                ->where('status', 0)
                ->order($sort, $order)
                ->paginate($limit);
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 审核（待审核商户）
     *
     * @param string|null $ids
     * @return mixed
     */
    public function audit($ids = null)
    {
        $ids = $ids !== null && $ids !== '' ? $ids : $this->request->param('ids');
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ((int)$row['status'] !== 0) {
            $this->error(__('Only pending merchant can be audited'));
        }

        if ($this->request->isPost()) {
            $this->token();
            $postIds = $this->request->post('ids', $ids);
            if ((string)$postIds !== (string)$row['id']) {
                $this->error(__('Invalid parameters'));
            }
            $action = $this->request->post('audit_action', '');
            $reason = trim((string)$this->request->post('reason', ''));

            if ($action === 'approve') {
                $updated = $this->model->where('id', $row['id'])->where('status', 0)->update([
                    'status' => 1,
                    'reason' => '',
                ]);
                if (!$updated) {
                    $this->error(__('Already audited or status changed'));
                }
                $this->success(__('Approved'));
            }
            if ($action === 'reject') {
                if ($reason === '') {
                    $this->error(__('Reject reason required'));
                }
                $updated = $this->model->where('id', $row['id'])->where('status', 0)->update([
                    'status' => 2,
                    'reason'  => $reason,
                ]);
                if (!$updated) {
                    $this->error(__('Already audited or status changed'));
                }
                $this->success(__('Rejected'));
            }
            $this->error(__('Invalid parameters'));
        }

        $idTypeList = [
            1 => __('Id card'),
            2 => __('Passport'),
            3 => __('Other id document'),
        ];
        $data = $row->toArray();
        $data['id_type_text'] = $idTypeList[(int)$row['id_type']] ?? (string)$row['id_type'];
        $data['image_url'] = $row['image'] ? cdnurl($row['image'], true) : '';
        $data['backimage_url'] = $row['backimage'] ? cdnurl($row['backimage'], true) : '';

        $this->view->assign('row', $data);
        return $this->view->fetch();
    }
}
