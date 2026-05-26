<?php

namespace app\admin\controller\merchant;

use app\admin\model\Merchant as MerchantModel;
use app\admin\model\Users;
use app\common\controller\Backend;
use app\common\library\WalletApi;
use think\Db;
use think\Exception;

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

    /** @var string 批量更新允许字段（汇美开关） */
    protected $multiFields = 'is_hm';

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
                $surety = (float)$row['surety'];
                $suretyBillId = (int)($row['surety_bill_id'] ?? 0);
                if ($surety > 0 || $suretyBillId > 0) {
                    $user = Users::get($row['user_id']);
                    if (!$user || trim((string)$user['uuid']) === '') {
                        $this->error(__('User uuid not found'));
                    }
                    $unfreeze = WalletApi::unfreezeAccount(
                        (int)$row['user_id'],
                        (string)$user['uuid'],
                        rtrim(rtrim(sprintf('%.4f', $surety), '0'), '.') ?: '0',
                        1
                    );
                    if (!$unfreeze['success']) {
                        $this->error($unfreeze['message'] ?: __('Wallet api unfreeze failed'));
                    }
                }
                $updated = $this->model->where('id', $row['id'])->where('status', 0)->update([
                    'status'         => 2,
                    'reason'         => $reason,
                    'surety_bill_id' => 0,
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

    /**
     * 汇美支付开关（仅审核通过商户）
     *
     * @param string|null $ids
     */
    public function multi($ids = null)
    {
        if (false === $this->request->isPost()) {
            $this->error(__('Invalid parameters'));
        }
        $ids = $ids ?: $this->request->post('ids');
        if (empty($ids)) {
            $this->error(__('Parameter %s can not be empty', 'ids'));
        }
        if (false === $this->request->has('params')) {
            $this->error(__('No rows were updated'));
        }
        parse_str($this->request->post('params'), $values);
        $values = array_intersect_key($values, array_flip(is_array($this->multiFields) ? $this->multiFields : explode(',', $this->multiFields)));
        if (empty($values) || !array_key_exists('is_hm', $values)) {
            $this->error(__('You have no permission'));
        }
        $isHm = (int)$values['is_hm'];
        if (!in_array($isHm, [0, 1], true)) {
            $this->error(__('Invalid parameters'));
        }

        $count = 0;
        Db::startTrans();
        try {
            $list = $this->model
                ->where('status', 1)
                ->where($this->model->getPk(), 'in', $ids)
                ->select();
            foreach ($list as $item) {
                $count += $item->allowField(['is_hm'])->save(['is_hm' => $isHm]);
            }
            Db::commit();
        } catch (Exception $e) {
            Db::rollback();
            $this->error($e->getMessage());
        }
        if ($count) {
            $this->success();
        }
        $this->error(__('No rows were updated'));
    }
}
