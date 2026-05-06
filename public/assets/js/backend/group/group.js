define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'group/group/index',
                    edit_url: 'group/group/edit',
                    member_url: 'group/member/index',
                    table: 'group',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'group.id',
                fixedColumns: true,
                fixedRightNumber: 1,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id'), sortable: true},
                        {field: 'name', title: __('name'), operate: 'LIKE'},
                        {field: 'avatar', title: '头像', events: Table.api.events.image, formatter: Table.api.formatter.image, operate: false},
                        {field: 'creator_id', title: '创建人',  operate: false},
                        {field: 'is_overt', title: '公开', formatter: function (value) {
                                if (value === 1) {
                                    return '<span class="label label-success">是</span>';
                                } else if(value === 2)  {
                                    return '<span class="label label-default">否</span>';
                                }
                            }, searchList: {1:'是',2:'否'}},
                        {field: 'is_dismiss', title: __('Status'), formatter: Table.api.formatter.status, searchList: {1:'解散',2:'正常'}},
                        {field: 'created_at', title: '创建时间', formatter: Table.api.formatter.datetime, operate: 'RANGE', addclass: 'datetimerange', sortable: true},
                        {field: 'operate', title: __('Operate'), table: table,
                            // 使用FastAdmin标准事件配置
                            events: Table.api.events.operate,
                            formatter: function(value, row, index) {
                                // 只返回编辑和成员按钮，使用配置的URL，弹框打开
                                var html = [];
                                // 编辑按钮（弹框）
                                // html.push('<a href="javascript:;" class="btn btn-xs btn-success btn-editone" data-toggle="tooltip" title="编辑" data-url="' + $.fn.bootstrapTable.defaults.extend.edit_url + '" data-id="' + row.id + '"><i class="fa fa-pencil"></i> 编辑</a> ');
                                // 成员按钮（弹框）
                                html.push('<a href="javascript:;" class="btn btn-xs btn-primary btn-dialog" data-toggle="tooltip" title="成员" data-url="' + $.fn.bootstrapTable.defaults.extend.member_url + '?group_id='+row.id+'" data-id="' + row.id + '"><i class="fa fa-users"></i> 成员</a>');
                                return html.join('');
                            }
                        }
                    ]
                ]
            });

            // 为表格绑定事件（自动处理弹框、跳转、请求）
            Table.api.bindevent(table);
        },
        edit: function () {
            Controller.api.bindevent();
        },
        member:function () {
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