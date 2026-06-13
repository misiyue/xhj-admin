<?php

namespace app\admin\controller\app\notice;

use app\admin\model\NoticeLetter as NoticeLetterModel;
use app\common\controller\Backend;

/**
 * 站内信
 *
 * @icon fa fa-envelope
 */
class Letter extends Backend
{
    /**
     * @var NoticeLetterModel
     */
    protected $model = null;

    protected $searchFields = 'id,user_id,title,content,url';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new NoticeLetterModel;
        $isReadList = NoticeLetterModel::getIsReadList();
        $this->assignconfig('isReadList', $isReadList);
    }
}
