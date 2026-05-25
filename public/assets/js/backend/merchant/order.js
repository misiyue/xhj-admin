define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var orderColumns = function (table, options) {
        options = options || {};
        var cols = [
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
            }
        ];
        if (options.showAppealJudge) {
            cols.push({
                field: 'appeal_judge',
                title: __('Appeal judgment'),
                operate: false,
                formatter: function (value, row) {
                    if (parseInt(row.is_appeal, 10) !== 1) {
                        return '<span class="label label-default">' + __('No') + '</span>';
                    }
                    return '<a href="javascript:;" class="btn btn-xs btn-warning btn-appeal-judge-detail" data-id="' + row.id + '" title="' + __('Appeal judgment detail') + '">' +
                        '<i class="fa fa-gavel"></i> ' + __('Detail') + '</a>';
                }
            });
        }
        if (options.showAppeal) {
            cols.push(
                {
                    field: 'appeal_id',
                    title: __('Appeal party id'),
                    operate: '=',
                    sortable: true
                },
                {
                    field: 'appeal_reason',
                    title: __('Appeal reason'),
                    operate: 'LIKE',
                    formatter: function (value) {
                        value = $.trim(value || '');
                        if (!value) {
                            return '-';
                        }
                        return value.length > 30 ? value.substring(0, 30) + '...' : value;
                    }
                },
                {
                    field: 'appeal_time',
                    title: __('Appeal time'),
                    operate: 'RANGE',
                    addclass: 'datetimerange',
                    formatter: Table.api.formatter.datetime,
                    sortable: true,
                    width: 160
                }
            );
        }
        cols.push(
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
                buttons: options.operateButtons || [],
                formatter: Table.api.formatter.operate
            }
        );
        return [cols];
    };

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
                columns: orderColumns(table, {
                    showAppealJudge: true,
                    operateButtons: [
                        {
                            name: 'detail',
                            text: __('Detail'),
                            title: __('Detail'),
                            classname: 'btn btn-xs btn-info btn-dialog',
                            icon: 'fa fa-list',
                            url: 'merchant/order/detail'
                        }
                    ]
                })
            });

            Table.api.bindevent(table);

            table.on('click', '.btn-appeal-judge-detail', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var id = $(this).data('id');
                var row = table.bootstrapTable('getRowByUniqueId', id);
                if (!row) {
                    return;
                }
                var wrongerList = Config.wrongerList || {};
                var wrongerText = wrongerList[row.wronger] !== undefined ? wrongerList[row.wronger] : row.wronger;
                var judgeText = $.trim(row.judge || '') || '-';
                var judgeTimeText = '-';
                if (parseInt(row.judge_time, 10) > 0) {
                    judgeTimeText = typeof Moment !== 'undefined'
                        ? Moment.unix(row.judge_time).format('YYYY-MM-DD HH:mm:ss')
                        : row.judge_time;
                }
                var html = '<div class="appeal-judge-layer" style="padding:18px 22px;line-height:2;font-size:14px;">' +
                    '<p><strong>' + __('Wronger') + '：</strong>' + wrongerText + '</p>' +
                    '<p><strong>' + __('Judge result') + '：</strong>' + $('<div/>').text(judgeText).html() + '</p>' +
                    '<p><strong>' + __('Judge time') + '：</strong>' + judgeTimeText + '</p>' +
                    '</div>';
                Layer.open({
                    type: 1,
                    title: __('Appeal judgment detail'),
                    area: ['460px', 'auto'],
                    shadeClose: true,
                    content: html
                });
            });
        },
        appeallist: function () {
            Table.api.init({
                extend: {
                    index_url: 'merchant/order/appeallist',
                    handle_url: 'merchant/order/handle',
                    table: 'merchant_order',
                }
            });

            var table = $("#table");

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'desc',
                columns: orderColumns(table, {
                    showAppeal: true,
                    operateButtons: [
                        {
                            name: 'handle',
                            text: __('Handle'),
                            title: __('Handle appeal'),
                            classname: 'btn btn-xs btn-success btn-dialog',
                            icon: 'fa fa-gavel',
                            url: 'merchant/order/handle'
                        }
                    ]
                })
            });

            Table.api.bindevent(table);
        },
        handle: function () {
            Form.api.bindevent($("#handle-form"), function () {
                parent.$(".btn-refresh").trigger("click");
                try {
                    if (parent.parent && parent.parent.$) {
                        parent.parent.$(".btn-refresh").trigger("click");
                    }
                } catch (err) {
                }
                var index = parent.Layer.getFrameIndex(window.name);
                parent.Layer.close(index);
                return false;
            });
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
