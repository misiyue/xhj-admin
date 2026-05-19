define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'merchant/task/index',
                    detail_url: 'merchant/task/detail',
                    table: 'merchant_task',
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
                        {field: 'user_id', title: __('User_id'), operate: '='},
                        {
                            field: 'currency_type',
                            title: __('Currency type'),
                            operate: '=',
                            searchList: Config.currencyTypeList,
                            formatter: Table.api.formatter.normal
                        },
                        {field: 'price', title: __('Price'), operate: 'BETWEEN', sortable: true},
                        {field: 'count', title: __('Count'), operate: false, sortable: true},
                        {
                            field: 'status',
                            title: __('Task status'),
                            operate: '=',
                            searchList: Config.statusList,
                            formatter: Table.api.formatter.normal
                        },
                        {
                            field: 'is_up',
                            title: __('Is on shelf'),
                            operate: '=',
                            searchList: Config.yesNoList,
                            formatter: function (value) {
                                return parseInt(value, 10) === 1
                                    ? '<span class="label label-success">' + __('Yes') + '</span>'
                                    : '<span class="label label-default">' + __('No') + '</span>';
                            }
                        },
                        {
                            field: 'up_time',
                            title: __('Shelf time'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true,
                            width: 160
                        },
                        {
                            field: 'is_deleted',
                            title: __('Is deleted'),
                            operate: '=',
                            searchList: Config.yesNoList,
                            formatter: function (value) {
                                return parseInt(value, 10) === 1
                                    ? '<span class="label label-danger">' + __('Yes') + '</span>'
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
                        },
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
                                    url: 'merchant/task/detail'
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
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
