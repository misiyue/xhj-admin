define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'merchant/hmpay/index',
                    table: 'merchant_hm_order',
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
                        {field: 'order_id', title: __('Order id'), operate: 'LIKE'},
                        {
                            field: 'amount',
                            title: __('Amount'),
                            operate: false,
                            sortable: false,
                            formatter: function (value) {
                                if (value === null || value === undefined || value === '') {
                                    return '-';
                                }
                                return Fast.api.escape(String(value));
                            }
                        },
                        {
                            field: 'restate',
                            title: __('Restate'),
                            operate: '=',
                            searchList: $.extend({'': __('All')}, Config.restateList || {}),
                            formatter: function (value) {
                                if (value === null || value === undefined || value === '') {
                                    return '-';
                                }
                                var isSuccess = parseInt(value, 10) === 0;
                                var cls = isSuccess ? 'success' : 'danger';
                                var text = isSuccess
                                    ? ((Config.restateList && Config.restateList[0]) ? Config.restateList[0] : __('Restate success'))
                                    : __('Restate failed');
                                return '<span class="label label-' + cls + '">' + Fast.api.escape(text) + '</span>';
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
                            field: 'created_at',
                            title: __('Createtime'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true,
                            width: 160
                        },
                        {
                            field: 'updated_at',
                            title: __('Updatetime'),
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
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
