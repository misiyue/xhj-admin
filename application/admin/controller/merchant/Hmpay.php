<?php

namespace app\admin\controller\merchant;

use app\admin\model\MerchantHmOrder as MerchantHmOrderModel;
use app\admin\model\MerchantOrder as MerchantOrderModel;
use app\common\controller\Backend;

/**
 * 汇美支付订单
 *
 * @icon fa fa-credit-card
 */
class Hmpay extends Backend
{
    /**
     * @var MerchantHmOrderModel
     */
    protected $model = null;

    protected $searchFields = 'id,order_id';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new MerchantHmOrderModel;
        $this->assignconfig('restateList', MerchantHmOrderModel::getRestateList());
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

            $rows = [];
            $orderIds = [];
            foreach ($list->items() as $item) {
                $row = $item instanceof \think\Model ? $item->toArray() : (array)$item;
                $orderId = trim((string)($row['order_id'] ?? ''));
                if ($orderId !== '') {
                    $orderIds[] = $orderId;
                }
                $rows[] = $row;
            }

            $amountMap = [];
            if ($orderIds) {
                $amountMap = MerchantOrderModel::where('order_id', 'in', array_values(array_unique($orderIds)))
                    ->column('amount', 'order_id');
            }

            foreach ($rows as &$row) {
                $orderId = trim((string)($row['order_id'] ?? ''));
                $row['amount'] = $orderId !== '' && isset($amountMap[$orderId]) ? $amountMap[$orderId] : null;
            }
            unset($row);

            $result = ['total' => $list->total(), 'rows' => $rows];

            return json($result);
        }
        return $this->view->fetch();
    }
}
