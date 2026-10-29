<?php

namespace app\admin\controller\user;

use app\admin\model\UserReport as UserReportModel;
use app\common\controller\Backend;
use think\Db;
use think\Exception;

/**
 * 用户举报
 *
 * @icon fa fa-flag
 */
class Report extends Backend
{
    /**
     * @var UserReportModel
     */
    protected $model = null;

    protected $searchFields = 'id,user_id,defe_id,reason';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new UserReportModel;
        $this->assignconfig('reportStatusList', UserReportModel::getStatusList());
        $this->assignconfig('reportResultList', UserReportModel::getResultList());
        $this->assignconfig('reportDefeTypeList', UserReportModel::getDefeTypeList());
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
                ->order($sort ?: 'id', $order ?: 'DESC')
                ->paginate($limit);

            $rows = [];
            foreach ($list as $item) {
                $rows[] = is_array($item) ? $item : $item->toArray();
            }
            $this->enrichReportRows($rows);

            return json(['total' => $list->total(), 'rows' => $rows]);
        }
        return $this->view->fetch();
    }

    /**
     * 详情 / 处理
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

        if ($this->request->isPost()) {
            $this->token();
            $action = $this->request->post('action', '');
            if ($action !== 'process') {
                $this->error(__('Invalid parameters'));
            }
            if ((int)$row['status'] !== 0) {
                $this->error(__('Report already processed'));
            }

            $result = (int)$this->request->post('result', 0);
            if (!in_array($result, [-1, 1, 2], true)) {
                $this->error(__('Invalid parameters'));
            }
            if ($result === 1 && (int)$row['defe_type'] !== 1) {
                $this->error(__('Account ban only applies to user reports'));
            }
            if ($result === 2 && (int)$row['defe_type'] !== 2) {
                $this->error(__('Group mute only applies to group reports'));
            }

            Db::startTrans();
            try {
                if ($result === 1) {
                    $defeId = (int)$row['defe_id'];
                    $affected = Db::name('users')->where('id', $defeId)->update([
                        'status'     => 0,
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                    if ($affected === 0 && !Db::name('users')->where('id', $defeId)->find()) {
                        throw new Exception(__('Report target user not found'));
                    }
                } elseif ($result === 2) {
                    $defeId = (int)$row['defe_id'];
                    $affected = Db::name('group')->where('id', $defeId)->update([
                        'force_status' => 1,
                        'updated_at'   => date('Y-m-d H:i:s'),
                    ]);
                    if ($affected === 0 && !Db::name('group')->where('id', $defeId)->find()) {
                        throw new Exception(__('Report target group not found'));
                    }
                }

                Db::name('user_report')->where('id', $row['id'])->update([
                    'status' => 1,
                    'result' => $result,
                ]);
                Db::commit();
            } catch (\Exception $e) {
                Db::rollback();
                $this->error($e->getMessage());
            }

            $this->success(__('Process success'));
        }

        $data = $row->toArray();
        $rows = [$data];
        $this->enrichReportRows($rows);
        $data = $rows[0];

        $this->view->assign('row', $data);
        return $this->view->fetch();
    }

    /**
     * @param array $rows
     */
    protected function enrichReportRows(array &$rows)
    {
        if (empty($rows)) {
            return;
        }

        $reporterIds = [];
        $defeUserIds = [];
        $defeGroupIds = [];
        foreach ($rows as $item) {
            if (!empty($item['user_id'])) {
                $reporterIds[] = (int)$item['user_id'];
            }
            $defeType = (int)($item['defe_type'] ?? 0);
            $defeId = (int)($item['defe_id'] ?? 0);
            if ($defeType === 1 && $defeId > 0) {
                $defeUserIds[] = $defeId;
            } elseif ($defeType === 2 && $defeId > 0) {
                $defeGroupIds[] = $defeId;
            }
        }

        $userIdList = array_unique(array_merge($reporterIds, $defeUserIds));
        $userMap = [];
        if ($userIdList) {
            $userMap = Db::name('users')->whereIn('id', $userIdList)->column('nickname', 'id');
        }

        $groupMap = [];
        if ($defeGroupIds) {
            $groupMap = Db::name('group')->whereIn('id', array_unique($defeGroupIds))->column('name', 'id');
        }

        $statusList = UserReportModel::getStatusList();
        $resultList = UserReportModel::getResultList();
        $defeTypeList = UserReportModel::getDefeTypeList();

        foreach ($rows as &$row) {
            $reporterId = (int)($row['user_id'] ?? 0);
            $row['reporter_nickname'] = $userMap[$reporterId] ?? '-';

            $defeType = (int)($row['defe_type'] ?? 0);
            $defeId = (int)($row['defe_id'] ?? 0);
            $row['defe_party_text'] = $this->formatDefePartyLabel($defeType, $defeId);

            if ($defeType === 1) {
                $row['defe_name'] = $userMap[$defeId] ?? '-';
            } elseif ($defeType === 2) {
                $row['defe_name'] = $groupMap[$defeId] ?? '-';
            } else {
                $row['defe_name'] = '-';
            }

            $row['defe_type_text'] = $defeTypeList[$defeType] ?? '-';
            $status = (int)($row['status'] ?? 0);
            $result = (int)($row['result'] ?? 0);
            $row['status_text'] = $statusList[$status] ?? (string)$status;
            $row['result_text'] = $resultList[$result] ?? (string)$result;
        }
        unset($row);
    }

    /**
     * @param int $defeType
     * @param int $defeId
     * @return string
     */
    protected function formatDefePartyLabel($defeType, $defeId)
    {
        if ($defeId <= 0) {
            return '-';
        }
        if ((int)$defeType === 1) {
            return __('Defe user prefix') . $defeId;
        }
        if ((int)$defeType === 2) {
            return __('Defe group prefix') . $defeId;
        }
        return '-';
    }
}
