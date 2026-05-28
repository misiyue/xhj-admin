define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'merchant/hdpay/index',
                    detail_url: 'merchant/hdpay/detail',
                    table: 'merchant_hd_order',
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
                        {field: 'order_no', title: __('Merchant order no'), operate: 'LIKE'},
                        {field: 'local_no', title: __('Platform order no'), operate: 'LIKE'},
                        {field: 'submit_amount', title: __('Submit amount'), operate: 'BETWEEN', sortable: true},
                        {
                            field: 'status',
                            title: __('Order status'),
                            operate: 'LIKE',
                            formatter: function (value, row) {
                                var status = $.trim(value || '');
                                var text = $.trim(row.status_text || '');
                                var cls = status.toLowerCase() === 'success' ? 'success' : 'danger';
                                var html = '<span class="label label-' + cls + '">' + Fast.api.escape(status || '-') + '</span>';
                                if (text) {
                                    html += ' <span class="text-muted">' + Fast.api.escape(text) + '</span>';
                                }
                                return html;
                            }
                        },
                        {
                            field: 'pay_url',
                            title: __('Pay url'),
                            operate: false,
                            formatter: function (value) {
                                value = $.trim(value || '');
                                if (!value) {
                                    return '-';
                                }
                                var shortUrl = value.length > 40 ? value.substring(0, 40) + '...' : value;
                                return '<a href="' + Fast.api.escape(value) + '" target="_blank" rel="noopener noreferrer" title="' + Fast.api.escape(value) + '">' + Fast.api.escape(shortUrl) + '</a>';
                            }
                        },
                        {
                            field: 'payed_at',
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
                                    url: 'merchant/hdpay/detail'
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
