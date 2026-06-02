<?php

namespace app\admin\controller\merchant;

use app\admin\model\Merchant as MerchantModel;
use app\admin\model\Users;
use app\common\controller\Backend;
use app\common\library\WalletApi;

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
        $this->assignconfig('payTypeList', MerchantModel::getPayTypeList());
        $this->assignconfig('hdPayTypeList', MerchantModel::getHdPayTypeList());
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
            $rows = [];
            foreach ($list->items() as $item) {
                $row = $item instanceof \think\Model ? $item->toArray() : (array)$item;
                $payTypesData = MerchantModel::parsePayTypesData($row['pay_types'] ?? '');
                $row['pay_types_list'] = array_keys($payTypesData);
                $row['pay_types_labels'] = MerchantModel::buildPayTypesDisplayLabels($payTypesData);
                $rows[] = $row;
            }
            $result = ['total' => $list->total(), 'rows' => $rows];

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
                    $unfreeze = WalletApi::unfreezenAccount(
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
     * 编辑开通支付（仅审核通过商户）
     *
     * @param string|null $ids
     * @return mixed
     */
    public function edit($ids = null)
    {
        $ids = $ids !== null && $ids !== '' ? $ids : $this->request->param('ids');
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ((int)$row['status'] !== 1) {
            $this->error(__('Only approved merchant can be edited'));
        }

        if ($this->request->isPost()) {
            $this->token();
            $postIds = $this->request->post('ids', $ids);
            if ((string)$postIds !== (string)$row['id']) {
                $this->error(__('Invalid parameters'));
            }
            $payTypes = $this->request->post('pay_types', []);
            $hdPayType = $this->request->post('pay_types_hd_pay_type', '');
            $enabledCodes = MerchantModel::normalizeEnabledCodes($payTypes);
            if (in_array(MerchantModel::PAY_TYPE_HD, $enabledCodes, true)
                && !MerchantModel::isValidHdPayType($hdPayType)) {
                $this->error(__('Hd pay type required'));
            }
            try {
                $payTypesJson = MerchantModel::encodePayTypesConfig($enabledCodes, $hdPayType);
                if ($payTypesJson === false) {
                    $this->error(__('Operation failed'));
                }
                $row->allowField(['pay_types'])->save(['pay_types' => $payTypesJson]);
            } catch (\InvalidArgumentException $e) {
                $this->error(__('Hd pay type required'));
            } catch (\Exception $e) {
                $this->error($e->getMessage());
            }
            $this->success();
        }

        $data = $row->toArray();
        $payTypesData = MerchantModel::parsePayTypesData($data['pay_types'] ?? '');
        $hdPayType = isset($payTypesData[MerchantModel::PAY_TYPE_HD]['pay_type'])
            ? (string)$payTypesData[MerchantModel::PAY_TYPE_HD]['pay_type']
            : '';
        $this->view->assign('row', $data);
        $this->view->assign('payTypeList', MerchantModel::getPayTypeList());
        $this->view->assign('hdPayTypeList', MerchantModel::getHdPayTypeList());
        $this->view->assign('payTypesChecked', array_keys($payTypesData));
        $this->view->assign('hdPayType', $hdPayType);
        return $this->view->fetch();
    }
}
