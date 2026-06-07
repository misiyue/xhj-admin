<?php

namespace app\admin\controller\merchant;

use app\admin\model\MerchantHdOrder as MerchantHdOrderModel;
use app\admin\model\MerchantOrder as MerchantOrderModel;
use app\admin\model\MerchantTask as MerchantTaskModel;
use app\common\controller\Backend;
use think\Db;
use think\Exception;

/**
 * 商户订单
 *
 * @icon fa fa-list-alt
 */
class Order extends Backend
{
    /** 后台裁定取消订单时写入 remark */
    const REMARK_JUDGE_CANCEL = '后台裁定取消';

    /**
     * @var MerchantOrderModel
     */
    protected $model = null;

    protected $searchFields = 'id,order_id,buyer_id,saler_id,task_id';

    /** 宏达支付详情（pay_type_id=4 列表点击，仅需登录） */
    protected $noNeedRight = ['paydetail'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new MerchantOrderModel;
        $this->view->assign('statusList', MerchantOrderModel::getStatusList());
        $this->view->assign('payTypeList', MerchantOrderModel::getPayTypeList());
        $this->view->assign('buyTypeList', MerchantOrderModel::getBuyTypeList());
        $this->view->assign('appealIdList', MerchantOrderModel::getAppealIdList());
        $this->view->assign('wrongerList', MerchantOrderModel::getWrongerList());
        $this->view->assign('yesNoList', MerchantOrderModel::getYesNoList());
        $this->assignconfig('statusList', MerchantOrderModel::getStatusList());
        $this->assignconfig('payTypeList', MerchantOrderModel::getPayTypeList());
        $this->assignconfig('buyTypeList', MerchantOrderModel::getBuyTypeList());
        $this->assignconfig('yesNoList', MerchantOrderModel::getYesNoList());
        $this->assignconfig('appealIdList', MerchantOrderModel::getAppealIdList());
        $this->assignconfig('wrongerList', MerchantOrderModel::getWrongerList());
    }

    /**
     * 列表
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
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 申诉订单列表（弹窗）
     */
    public function appeallist()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->where($where)
                ->where('is_appeal', 1)
                ->where('judge_time', 0)
                ->where('status', 1)
                ->order($sort, $order)
                ->paginate($limit);
            $result = array("total" => $list->total(), "rows" => $list->items());

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 申诉处理
     *
     * @param string|null $ids
     * @return mixed
     */
    public function handle($ids = null)
    {
        $ids = $ids !== null && $ids !== '' ? $ids : $this->request->param('ids');
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ((int)$row['is_appeal'] !== 1 || (int)$row['judge_time'] !== 0 || (int)$row['status'] !== 1) {
            $this->error(__('Only pending appeal order can be handled'));
        }

        if ($this->request->isPost()) {
            $this->token();
            $postIds = $this->request->post('ids', $ids);
            if ((string)$postIds !== (string)$row['id']) {
                $this->error(__('Invalid parameters'));
            }
            $wronger = $this->request->post('wronger', '');
            $judge = trim((string)$this->request->post('judge', ''));
            if ($wronger === '' || !in_array((int)$wronger, [0, 1, 2], true)) {
                $this->error(__('Wronger required'));
            }
            $wronger = (int)$wronger;
            if ($judge === '') {
                $this->error(__('Judge result required'));
            }
            $cancelOrder = (int)$this->request->post('cancel_order', 0) === 1;
            $judgeTime = time();

            Db::startTrans();
            try {
                $order = $this->model
                    ->where('id', $row['id'])
                    ->where('is_appeal', 1)
                    ->where('judge_time', 0)
                    ->where('status', 1)
                    ->lock(true)
                    ->find();
                if (!$order) {
                    throw new Exception(__('Already handled or status changed'));
                }
                $update = [
                    'wronger'    => $wronger,
                    'judge'      => $judge,
                    'judge_time' => $judgeTime,
                ];
                // 勾选取消订单：数量退回挂单，订单置为已取消
                if ($cancelOrder) {
                    $update['status'] = 3;
                    $update['is_cancel'] = 1;
                    $update['cancel_time'] = $judgeTime;
                    $update['remark'] = self::REMARK_JUDGE_CANCEL;
                    $taskId = (int)$order['task_id'];
                    $orderCounts = (float)$order['counts'];
                    if ($taskId > 0 && $orderCounts > 0) {
                        $taskModel = new MerchantTaskModel();
                        $task = $taskModel
                            ->where('id', $taskId)
                            ->where('is_deleted', 0)
                            ->lock(true)
                            ->find();
                        if (!$task) {
                            throw new Exception(__('Task not found or deleted'));
                        }
                        $restored = $taskModel
                            ->where('id', $taskId)
                            ->where('is_deleted', 0)
                            ->setInc('count', $orderCounts);
                        if (!$restored) {
                            throw new Exception(__('Failed to restore task count'));
                        }
                    }
                } elseif ((int)$order['status'] === 4) {
                    $update['status'] = 2;
                }
                $updated = $this->model
                    ->where('id', $order['id'])
                    ->where('is_appeal', 1)
                    ->where('judge_time', 0)
                    ->where('status', 1)
                    ->update($update);
                if (!$updated) {
                    throw new Exception(__('Already handled or status changed'));
                }
                Db::commit();
            } catch (\Throwable $e) {
                Db::rollback();
                $this->error($e->getMessage());
            }
            $this->success(__('Handle success'));
        }

        $data = $this->formatOrderRow($row);
        $this->view->assign('row', $data);
        $this->view->assign('handleWrongerList', MerchantOrderModel::getWrongerList());
        return $this->view->fetch();
    }

    /**
     * 宏达支付详情（pay_type_id=4，按 order_id 查 merchant_hd_order）
     *
     * @param string|null $ids
     */
    public function paydetail($ids = null)
    {
        $ids = $ids !== null && $ids !== '' ? $ids : $this->request->param('ids');
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ((int)$row['pay_type_id'] !== MerchantOrderModel::PAY_TYPE_HD) {
            $this->error(__('Invalid parameters'));
        }

        $orderNo = trim((string)$row['order_id']);
        if ($orderNo === '') {
            $this->error(__('Order no empty'));
        }
        $hdOrder = (new MerchantHdOrderModel())->where('order_no', $orderNo)->find();
        if (!$hdOrder) {
            $this->error(__('Hd order not found'));
        }

        $payTypeList = MerchantOrderModel::getPayTypeList();
        $payload = [
            'pay_type_id'   => MerchantOrderModel::PAY_TYPE_HD,
            'pay_type_text' => $payTypeList[MerchantOrderModel::PAY_TYPE_HD] ?? '',
            'order_id'      => $orderNo,
            'items'         => MerchantHdOrderModel::buildDisplayItems($hdOrder),
        ];
        $this->success('', null, $payload);
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
        $this->view->assign('row', $this->formatOrderRow($row));
        return $this->view->fetch();
    }

    /**
     * 订单展示字段
     *
     * @param \think\Model|array $row
     * @return array
     */
    protected function formatOrderRow($row)
    {
        $data = is_array($row) ? $row : $row->toArray();
        $statusList = MerchantOrderModel::getStatusList();
        $payTypeList = MerchantOrderModel::getPayTypeList();
        $buyTypeList = MerchantOrderModel::getBuyTypeList();
        $appealIdList = MerchantOrderModel::getAppealIdList();
        $wrongerList = MerchantOrderModel::getWrongerList();
        $yesNoList = MerchantOrderModel::getYesNoList();

        $data['status_text'] = $statusList[(int)$data['status']] ?? (string)$data['status'];
        $payTypeId = (int)($data['pay_type_id'] ?? 0);
        $data['pay_type_text'] = $payTypeList[$payTypeId] ?? (string)$payTypeId;
        $data['pay_type_info_text'] = MerchantOrderModel::formatPayTypeInfoDisplay($data['pay_type_info'] ?? '');
        $data['buy_type_text'] = $buyTypeList[(int)$data['buy_type']] ?? (string)$data['buy_type'];
        $data['appeal_id_text'] = $appealIdList[(int)$data['appeal_id']] ?? (string)$data['appeal_id'];
        $data['wronger_text'] = $wrongerList[(int)$data['wronger']] ?? (string)$data['wronger'];
        $data['is_cancel_text'] = $yesNoList[(int)$data['is_cancel']] ?? (string)$data['is_cancel'];
        $data['is_appeal_text'] = $yesNoList[(int)$data['is_appeal']] ?? (string)$data['is_appeal'];
        $data['pay_time_text'] = MerchantOrderModel::formatUnixTime($data['pay_time'] ?? 0);
        $data['cancel_time_text'] = MerchantOrderModel::formatUnixTime($data['cancel_time'] ?? 0);
        $data['appeal_time_text'] = MerchantOrderModel::formatUnixTime($data['appeal_time'] ?? 0);
        $data['judge_time_text'] = MerchantOrderModel::formatUnixTime($data['judge_time'] ?? 0);
        $data['pay_img_url'] = MerchantOrderModel::formatPayImgUrl($data['pay_img'] ?? '');
        $judge = trim((string)($data['judge'] ?? ''));
        $data['judge_result'] = $judge !== '' ? $judge : '-';

        return $data;
    }
}
