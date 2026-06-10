define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'user/user/index',
                    detail_url: 'user/user/detail',
                    table: 'users',
                }
            });

            var table = $("#table");

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'users.id',
                fixedColumns: true,
                fixedRightNumber: 1,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id'), sortable: true},
                        {field: 'username', title: __('Username'), operate: 'LIKE'},
                        {field: 'nickname', title: __('Nickname'), operate: 'LIKE'},
                        {field: 'email', title: __('Email'), operate: 'LIKE'},
                        {field: 'mobile', title: __('Mobile'), operate: 'LIKE'},
                        {field: 'avatar', title: '头像', events: Table.api.events.image, formatter: Table.api.formatter.image, operate: false},
                        {field: 'gender', title: __('Gender'), visible: false, searchList: {1: __('Male'), 0: __('Female')}},
                        {field: 'uuid', title: '钱包ID', operate: 'BETWEEN', sortable: true},
                        {
                            field: 'status',
                            title: __('Status'),
                            formatter: function (value) {
                                if (parseInt(value, 10) === 1) {
                                    return '<span class="label label-success">' + __('Normal') + '</span>';
                                } else if (parseInt(value, 10) === 2) {
                                    return '<span class="label label-danger">' + __('Banned') + '</span>';
                                }
                                return '-';
                            },
                            searchList: {1: __('Normal'), 2: __('Banned')}
                        },
                        {field: 'created_at', title: __('Jointime'), formatter: Table.api.formatter.datetime, operate: 'RANGE', addclass: 'datetimerange', sortable: true},
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            buttons: [
                                {
                                    name: 'detail',
                                    text: __('Detail'),
                                    title: __('Detail'),
                                    classname: 'btn btn-xs btn-info btn-dialog',
                                    icon: 'fa fa-list',
                                    url: 'user/user/detail'
                                }
                            ],
                            formatter: Table.api.formatter.operate
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        detail: function () {
            Form.api.bindevent($("#detail-form"));

            var statusTextMap = {1: __('Normal'), 2: __('Banned')};

            $("#c-status").on("change", function () {
                var status = $(this).val();
                var ids = $("input[name='ids']").val();
                Fast.api.ajax({
                    url: 'user/user/detail/ids/' + ids,
                    data: {
                        action: 'status',
                        status: status,
                        __token__: $("input[name='__token__']").val()
                    }
                }, function () {
                    $("#status-text").text(statusTextMap[status] || '-');
                    parent.$(".btn-refresh").trigger("click");
                }, function () {
                    var current = status == 1 ? 2 : 1;
                    $("#c-status").val(current);
                    var switcher = $(".btn-user-status i");
                    if (parseInt(current, 10) === 1) {
                        switcher.removeClass("fa-flip-horizontal text-gray");
                    } else {
                        switcher.addClass("fa-flip-horizontal text-gray");
                    }
                });
            });

            $(".btn-reset-password").on("click", function () {
                var password = $.trim($("#c-password").val());
                if (!password) {
                    Toastr.error(__('Password required'));
                    return false;
                }
                var ids = $("input[name='ids']").val();
                Fast.api.ajax({
                    url: 'user/user/detail/ids/' + ids,
                    data: {
                        action: 'resetpassword',
                        password: password,
                        __token__: $("input[name='__token__']").val()
                    }
                }, function () {
                    $("#c-password").val('');
                });
                return false;
            });
        },
        add: function () {
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
