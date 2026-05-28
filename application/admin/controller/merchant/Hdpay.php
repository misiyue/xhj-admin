<?php

namespace app\admin\controller\merchant;

use app\admin\model\MerchantHdOrder as MerchantHdOrderModel;
use app\common\controller\Backend;

/**
 * 汇美支付订单
 *
 * @icon fa fa-credit-card
 */
class Hdpay extends Backend
{
    /**
     * @var MerchantHdOrderModel
     */
    protected $model = null;

    protected $searchFields = 'id,order_no,local_no';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new MerchantHdOrderModel;
        $this->assignconfig('statusList', MerchantHdOrderModel::getStatusList());
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
            $result = ['total' => $list->total(), 'rows' => $list->items()];

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
        $this->view->assign('row', $this->formatRow($row));
        return $this->view->fetch();
    }

    /**
     * @param \think\Model|array $row
     * @return array
     */
    protected function formatRow($row)
    {
        $data = is_array($row) ? $row : $row->toArray();
        $status = strtolower(trim((string)($data['status'] ?? '')));
        $data['status_is_success'] = $status === 'success';
        $data['status_label_class'] = $data['status_is_success'] ? 'success' : 'danger';
        $data['payed_at_text'] = MerchantHdOrderModel::formatDisplayDatetime($data['payed_at'] ?? '');
        $data['created_at_text'] = MerchantHdOrderModel::formatDisplayDatetime($data['created_at'] ?? '');
        $data['updated_at_text'] = MerchantHdOrderModel::formatDisplayDatetime($data['updated_at'] ?? '');
        $payUrl = trim((string)($data['pay_url'] ?? ''));
        $data['pay_url_display'] = $payUrl !== '' ? $payUrl : '-';

        return $data;
    }
}
