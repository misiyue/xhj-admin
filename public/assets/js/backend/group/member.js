define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            let params = new URLSearchParams(location.search);
            let groupId = params.get('group_id');
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'group/member/index',
                    edit_url: 'group/member/edit',
                    del_url: 'group/member/del',
                    multi_url: 'group/member/multi',
                    table: 'group-member',
                },
                query: {
                    "group_member.group_id": groupId,
                }
            });

            const table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url+'?group_id='+groupId,
                pk: 'id',
                sortName: 'group_member.id',
                fixedColumns: true,
                fixedRightNumber: 1,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id'), sortable: true},
                        {field: 'username', title: '账号', operate: false},
                        {field: 'nickname', title: '昵称', operate: false},
                        {field: 'avatar', title: '头像', events: Table.api.events.image, formatter: Table.api.formatter.image, operate: false},
                        {field: 'leader', title: '身份',  formatter: function (value) {
                                if (value === 1) {
                                    return '群主';
                                } else if(value === 2)  {
                                    return '管理员';
                                }else if(value === 3)  {
                                    return '普通成员';
                                }
                            }, searchList: {1:'是',2:'否'}},
                        {field: 'is_mute', title: '状态', formatter: function (value) {
                                if (value === 2) {
                                    return '<span class="label label-success">正常</span>';
                                } else if(value === 1)  {
                                    return '<span class="label label-danger">禁言</span>';
                                }
                            }, searchList: {1:'禁言',2:'正常'}},
                        {field: 'created_at', title: '创建时间', formatter: Table.api.formatter.datetime, operate: 'RANGE', addclass: 'datetimerange', sortable: true},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});