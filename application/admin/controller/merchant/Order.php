<?php

namespace app\admin\controller\merchant;

use app\admin\model\MerchantOrder as MerchantOrderModel;
use app\common\controller\Backend;

/**
 * 商户订单
 *
 * @icon fa fa-list-alt
 */
class Order extends Backend
{
    /**
     * @var MerchantOrderModel
     */
    protected $model = null;

    protected $searchFields = 'id,order_id,buyer_id,saler_id,task_id';

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
        $data = $row->toArray();
        $statusList = MerchantOrderModel::getStatusList();
        $payTypeList = MerchantOrderModel::getPayTypeList();
        $buyTypeList = MerchantOrderModel::getBuyTypeList();
        $appealIdList = MerchantOrderModel::getAppealIdList();
        $wrongerList = MerchantOrderModel::getWrongerList();
        $yesNoList = MerchantOrderModel::getYesNoList();

        $data['status_text'] = $statusList[(int)$data['status']] ?? (string)$data['status'];
        $data['pay_type_text'] = $payTypeList[(int)($data['pay_type'] ?? 0)] ?? (string)($data['pay_type'] ?? '');
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

        $this->view->assign('row', $data);
        return $this->view->fetch();
    }
}
