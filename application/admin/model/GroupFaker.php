<?php

namespace app\admin\model;

use think\Model;

/**
 * 群虚拟成员关联模型
 */
class GroupFaker extends Model
{
    protected $table = 'group_faker';

    protected $autoWriteTimestamp = false;

    protected $pk = 'faker_id';
}
