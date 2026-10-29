define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'group/group/index',
                    edit_url: 'group/group/edit',
                    member_url: 'group/member/index',
                    faker_url: 'group/faker/index',
                    forcestatus_url: 'group/group/forcestatus',
                    table: 'group',
                }
            });

            var table = $("#table");

            var escapeHtml = function (str) {
                return String(str == null ? '' : str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            var openForceStatusDialog = function (row) {
                var current = parseInt(row.force_status, 10) === 1 ? 1 : 0;
                var groupName = escapeHtml(row.name || '-');
                var content = ''
                    + '<div style="padding:20px 24px 8px;">'
                    + '<p class="text-muted" style="margin-bottom:12px;">群 ID：' + escapeHtml(row.id) + '　名称：' + groupName + '</p>'
                    + '<label class="radio-inline" style="margin-right:16px;">'
                    + '<input type="radio" name="force_status_pick" value="0"' + (current === 0 ? ' checked' : '') + '> 正常'
                    + '</label>'
                    + '<label class="radio-inline">'
                    + '<input type="radio" name="force_status_pick" value="1"' + (current === 1 ? ' checked' : '') + '> 群禁言'
                    + '</label>'
                    + '</div>';

                Layer.open({
                    type: 1,
                    title: '修改强制状态',
                    area: ['400px', 'auto'],
                    content: content,
                    btn: ['确定', '取消'],
                    yes: function (index, layero) {
                        var forceStatus = layero.find('input[name="force_status_pick"]:checked').val();
                        Fast.api.ajax({
                            url: $.fn.bootstrapTable.defaults.extend.forcestatus_url,
                            type: 'POST',
                            data: {
                                ids: row.id,
                                force_status: forceStatus
                            }
                        }, function () {
                            table.bootstrapTable('refresh');
                            Layer.close(index);
                        });
                        return false;
                    }
                });
            };

            var formatForceStatus = function (value, row) {
                var v = parseInt(value, 10);
                var label = v === 1 ? '群禁言' : '正常';
                var cls = v === 1 ? 'label-danger' : 'label-success';
                return '<a href="javascript:;" class="btn-force-status">'
                    + '<span class="label ' + cls + '" style="cursor:pointer">' + label + '</span></a>';
            };

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
                        {
                            field: 'force_status',
                            title: '强制状态',
                            operate: '=',
                            sortable: true,
                            searchList: {0: '正常', 1: '群禁言'},
                            formatter: formatForceStatus,
                            events: {
                                'click .btn-force-status': function (e, value, row) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openForceStatusDialog(row);
                                }
                            }
                        },
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
                                html.push('<a href="javascript:;" class="btn btn-xs btn-primary btn-dialog" data-toggle="tooltip" title="成员" data-url="' + $.fn.bootstrapTable.defaults.extend.member_url + '?group_id='+row.id+'" data-id="' + row.id + '"><i class="fa fa-users"></i> 成员</a> ');
                                // 虚拟成员按钮（弹框）
                                html.push('<a href="javascript:;" class="btn btn-xs btn-warning btn-dialog" data-toggle="tooltip" title="虚拟成员" data-url="' + $.fn.bootstrapTable.defaults.extend.faker_url + '?group_id='+row.id+'" data-id="' + row.id + '"><i class="fa fa-user-secret"></i> 虚拟成员</a>');
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
