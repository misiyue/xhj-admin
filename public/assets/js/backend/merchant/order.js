define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'merchant/order/index',
                    detail_url: 'merchant/order/detail',
                    table: 'merchant_order',
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
                        {field: 'order_id', title: __('Order no'), operate: 'LIKE'},
                        {field: 'buyer_id', title: __('Buyer_id'), operate: '='},
                        {field: 'saler_id', title: __('Saler_id'), operate: '='},
                        {field: 'amount', title: __('Amount'), operate: 'BETWEEN', sortable: true},
                        {field: 'task_id', title: __('Task_id'), operate: '='},
                        {field: 'counts', title: __('Counts'), operate: false},
                        {
                            field: 'status',
                            title: __('Order status'),
                            operate: '=',
                            searchList: Config.statusList,
                            formatter: Table.api.formatter.normal
                        },
                        {
                            field: 'pay_type',
                            title: __('Pay type'),
                            operate: '=',
                            searchList: Config.payTypeList,
                            formatter: Table.api.formatter.normal
                        },
                        {
                            field: 'buy_type',
                            title: __('Buy type'),
                            operate: '=',
                            searchList: Config.buyTypeList,
                            formatter: Table.api.formatter.normal
                        },
                        {
                            field: 'is_cancel',
                            title: __('Is cancelled'),
                            operate: '=',
                            searchList: Config.yesNoList,
                            formatter: function (value) {
                                return parseInt(value, 10) === 1
                                    ? '<span class="label label-warning">' + __('Yes') + '</span>'
                                    : '<span class="label label-default">' + __('No') + '</span>';
                            }
                        },
                        {
                            field: 'is_appeal',
                            title: __('Is appeal'),
                            operate: '=',
                            searchList: Config.yesNoList,
                            formatter: function (value) {
                                return parseInt(value, 10) === 1
                                    ? '<span class="label label-danger">' + __('Yes') + '</span>'
                                    : '<span class="label label-default">' + __('No') + '</span>';
                            }
                        },
                        {
                            field: 'pay_time',
                            title: __('Pay time'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true,
                            width: 160
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
                                    url: 'merchant/order/detail'
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
