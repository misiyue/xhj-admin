define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'merchant/merchant/index',
                    table: 'merchant',
                }
            });

            var table = $("#table");

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'desc',
                columns: [
                    [
                        {field: 'id', title: __('Id'), sortable: true},
                        {field: 'nickname', title: __('Merchant name'), operate: 'LIKE'},
                        {field: 'user_id', title: __('User_id'), operate: '='},
                        {
                            field: 'is_limit',
                            title: __('Is limited'),
                            operate: '=',
                            searchList: {0: __('No'), 1: __('Yes')},
                            formatter: function (value) {
                                return parseInt(value, 10) === 1
                                    ? '<span class="label label-danger">' + __('Yes') + '</span>'
                                    : '<span class="label label-default">' + __('No') + '</span>';
                            }
                        },
                        {
                            field: 'is_frozen',
                            title: __('Is frozen'),
                            operate: '=',
                            searchList: {0: __('No'), 1: __('Yes')},
                            formatter: function (value) {
                                return parseInt(value, 10) === 1
                                    ? '<span class="label label-danger">' + __('Yes') + '</span>'
                                    : '<span class="label label-default">' + __('No') + '</span>';
                            }
                        },
                        {
                            field: 'is_close',
                            title: __('Is closed'),
                            operate: '=',
                            searchList: {0: __('No'), 1: __('Yes')},
                            formatter: function (value) {
                                return parseInt(value, 10) === 1
                                    ? '<span class="label label-warning">' + __('Yes') + '</span>'
                                    : '<span class="label label-default">' + __('No') + '</span>';
                            }
                        },
                        {
                            field: 'created_at',
                            title: __('Createtime'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true,
                            width: 160
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        auditlist: function () {
            Table.api.init({
                extend: {
                    index_url: 'merchant/merchant/auditlist',
                    audit_url: 'merchant/merchant/audit',
                    table: 'merchant',
                }
            });

            var table = $("#table");

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'desc',
                columns: [
                    [
                        {field: 'id', title: __('Id'), sortable: true},
                        {field: 'nickname', title: __('Merchant name'), operate: 'LIKE'},
                        {field: 'user_id', title: __('User_id'), operate: '='},
                        {field: 'realname', title: __('Realname'), operate: 'LIKE'},
                        {
                            field: 'created_at',
                            title: __('Createtime'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true,
                            width: 160
                        },
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            buttons: [
                                {
                                    name: 'audit',
                                    text: __('Audit'),
                                    title: __('Audit'),
                                    classname: 'btn btn-xs btn-success btn-dialog',
                                    icon: 'fa fa-gavel',
                                    url: 'merchant/merchant/audit'
                                }
                            ],
                            formatter: Table.api.formatter.operate
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        audit: function () {
            var $form = $("#audit-form");
            var submit = function (action) {
                $('#audit-action').val(action);
                if (action === 'reject') {
                    var reason = $.trim($form.find('textarea[name="reason"]').val());
                    if (!reason) {
                        Layer.msg(__('Reject reason required'));
                        return;
                    }
                }
                Fast.api.ajax({
                    url: $form.attr('action') || location.href,
                    data: $form.serialize()
                }, function () {
                    parent.$(".btn-refresh").trigger("click");
                    try {
                        if (parent.parent && parent.parent.$) {
                            parent.parent.$(".btn-refresh").trigger("click");
                        }
                    } catch (e) {
                    }
                    var index = parent.Layer.getFrameIndex(window.name);
                    parent.Layer.close(index);
                });
            };
            $form.on('click', '.btn-audit-approve', function () {
                submit('approve');
            });
            $form.on('click', '.btn-audit-reject', function () {
                submit('reject');
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
