<?php

namespace app\admin\controller\merchant;

use app\admin\model\MerchantPayment as MerchantPaymentModel;
use app\common\controller\Backend;

/**
 * 第三方支付通道
 *
 * @icon fa fa-exchange
 */
class Payment extends Backend
{
    /**
     * @var MerchantPaymentModel
     */
    protected $model = null;

    protected $searchFields = 'id,title,code,platform';

    protected $modelValidate = true;

    protected $modelSceneValidate = true;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new MerchantPaymentModel;
        $platformList = MerchantPaymentModel::getPlatformList();
        $this->view->assign('platformList', $platformList);
        $this->assignconfig('platformList', $platformList);
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        return parent::add();
    }

    public function edit($ids = null)
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        return parent::edit($ids);
    }
}
