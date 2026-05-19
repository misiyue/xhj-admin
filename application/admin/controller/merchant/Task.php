<?php

namespace app\admin\controller\merchant;

use app\admin\model\MerchantTask as MerchantTaskModel;
use app\common\controller\Backend;

/**
 * 商户挂单任务
 *
 * @icon fa fa-tasks
 */
class Task extends Backend
{
    /**
     * @var MerchantTaskModel
     */
    protected $model = null;

    protected $searchFields = 'id,user_id';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new MerchantTaskModel;
        $this->assignconfig('statusList', MerchantTaskModel::getStatusList());
        $this->assignconfig('currencyTypeList', MerchantTaskModel::getCurrencyTypeList());
        $this->assignconfig('yesNoList', MerchantTaskModel::getYesNoList());
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
        $statusList = MerchantTaskModel::getStatusList();
        $currencyList = MerchantTaskModel::getCurrencyTypeList();
        $yesNoList = MerchantTaskModel::getYesNoList();

        $data['status_text'] = $statusList[(int)$data['status']] ?? (string)$data['status'];
        $data['currency_type_text'] = $currencyList[(int)$data['currency_type']] ?? (string)$data['currency_type'];
        $data['is_up_text'] = $yesNoList[(int)$data['is_up']] ?? (string)$data['is_up'];
        $data['is_deleted_text'] = $yesNoList[(int)$data['is_deleted']] ?? (string)$data['is_deleted'];
        $data['up_time_text'] = MerchantTaskModel::formatUnixTime($data['up_time'] ?? 0);

        $this->view->assign('row', $data);
        $this->view->assign('paytype_list', MerchantTaskModel::parsePaytypeList($data['paytype'] ?? ''));
        return $this->view->fetch();
    }
}
