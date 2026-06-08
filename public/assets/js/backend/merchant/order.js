define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'moment'], function ($, undefined, Backend, Table, Form, Moment) {

    var findRowById = function (table, id) {
        id = parseInt(id, 10);
        if (!id) {
            return null;
        }
        var row = table.bootstrapTable('getRowByUniqueId', id);
        if (row) {
            return row;
        }
        var data = table.bootstrapTable('getData') || [];
        for (var i = 0; i < data.length; i++) {
            if (parseInt(data[i].id, 10) === id) {
                return data[i];
            }
        }
        return null;
    };

    var openAppealJudgeDetail = function (row) {
        var wrongerList = Config.wrongerList || {};
        var wrongerText = wrongerList[row.wronger] !== undefined ? wrongerList[row.wronger] : (row.wronger !== undefined && row.wronger !== '' ? row.wronger : '-');
        var judgeText = $.trim(row.judge || '') || '-';
        var judgeTimeText = '-';
        var judgeTime = parseInt(row.judge_time, 10);
        if (judgeTime > 0) {
            judgeTimeText = Moment.unix(judgeTime).format('YYYY-MM-DD HH:mm:ss');
        }
        var html = '<div class="appeal-judge-layer" style="padding:18px 22px;line-height:2;font-size:14px;">' +
            '<p><strong>' + __('Wronger') + '：</strong>' + $('<div/>').text(wrongerText).html() + '</p>' +
            '<p><strong>' + __('Judge result') + '：</strong>' + $('<div/>').text(judgeText).html() + '</p>' +
            '<p><strong>' + __('Judge time') + '：</strong>' + $('<div/>').text(judgeTimeText).html() + '</p>' +
            '</div>';
        Layer.open({
            type: 1,
            title: __('Appeal judgment detail'),
            area: ['480px', 'auto'],
            shadeClose: true,
            content: html
        });
    };

    var escapeHtml = function (text) {
        return $('<div/>').text(text == null ? '' : String(text)).html();
    };

    var openPayTypeDetail = function (payload) {
        payload = payload || {};
        var items = payload.items || [];
        var html = '<div class="pay-type-detail-layer" style="padding:18px 22px;line-height:2;font-size:14px;">';
        html += '<p><strong>' + __('Pay type') + '：</strong>' + escapeHtml(payload.pay_type_text || '-') + '</p>';
        if (payload.order_id) {
            html += '<p><strong>' + __('Order no') + '：</strong>' + escapeHtml(payload.order_id) + '</p>';
        }
        $.each(items, function (i, item) {
            var label = escapeHtml(item.label || '');
            var val = item.value == null || item.value === '' ? '-' : String(item.value);
            var valHtml;
            if (item.is_url && val !== '-') {
                valHtml = '<a href="' + escapeHtml(val) + '" target="_blank" rel="noopener">' + escapeHtml(val) + '</a>';
            } else {
                valHtml = escapeHtml(val);
            }
            html += '<p><strong>' + label + '：</strong>' + valHtml + '</p>';
        });
        html += '</div>';
        Layer.open({
            type: 1,
            title: __('Pay type detail'),
            area: ['520px', 'auto'],
            shadeClose: true,
            content: html
        });
    };

    var parsePayTypeInfo = function (raw) {
        raw = $.trim(raw == null ? '' : String(raw));
        if (!raw || raw === '0') {
            return null;
        }
        try {
            var obj = JSON.parse(raw);
            return $.isPlainObject(obj) ? obj : null;
        } catch (err) {
            return null;
        }
    };

    var buildAccountPayPayloadFromRow = function (row) {
        var payTypeList = Config.payTypeList || {};
        var payTypeId = parseInt(row.pay_type_id, 10);
        var info = parsePayTypeInfo(row.pay_type_info);
        if (!info) {
            Toastr.error(__('Pay type info invalid'));
            return null;
        }
        var accountTypeId = parseInt(info.type_id, 10);
        return {
            pay_type_id: payTypeId,
            pay_type_text: payTypeList[payTypeId] || String(payTypeId),
            order_id: row.order_id || '',
            items: [
                {label: __('Account pay id'), value: info.id != null && info.id !== '' ? String(info.id) : '-'},
                {label: __('Account pay type'), value: payTypeList[accountTypeId] || String(info.type_id || '-')},
                {label: __('Account no'), value: info.account ? String(info.account) : '-'},
                {label: __('Account nickname'), value: info.nickname ? String(info.nickname) : '-'},
                {label: __('Open bank'), value: info.open_bank ? String(info.open_bank) : '-'}
            ]
        };
    };

    var buildOtherPayPayloadFromRow = function (row) {
        var payTypeList = Config.payTypeList || {};
        var payTypeId = parseInt(row.pay_type_id, 10);
        var raw = $.trim(row.pay_type_info == null ? '' : String(row.pay_type_info));
        var display = '-';
        if (raw && raw !== '0') {
            var info = parsePayTypeInfo(raw);
            display = info ? JSON.stringify(info, null, 2) : raw;
        }
        return {
            pay_type_id: payTypeId,
            pay_type_text: payTypeList[payTypeId] || String(payTypeId),
            order_id: row.order_id || '',
            items: [{label: __('Pay type info'), value: display}]
        };
    };

    var bindPayTypeDetail = function (table) {
        table.closest('.panel-body, .widget-body').on('click', '.btn-pay-type-detail', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(this).data('id');
            if (!id) {
                return;
            }
            var row = findRowById(table, id);
            if (!row) {
                Toastr.error(__('No Results were found'));
                return;
            }
            var payTypeId = parseInt(row.pay_type_id, 10);
            if (payTypeId > 0 && payTypeId < 4) {
                var localPayload = buildAccountPayPayloadFromRow(row);
                if (localPayload) {
                    openPayTypeDetail(localPayload);
                }
                return;
            }
            if (payTypeId !== 4) {
                openPayTypeDetail(buildOtherPayPayloadFromRow(row));
                return;
            }
            var index = Layer.load(1, {shade: [0.1, '#fff']});
            Fast.api.ajax({
                url: 'merchant/order/paydetail',
                data: {ids: id}
            }, function (data, ret) {
                Layer.close(index);
                var payload = (ret && ret.data) ? ret.data : data;
                openPayTypeDetail(payload);
                return false;
            }, function () {
                Layer.close(index);
            });
        });
    };

    /** 支付方式列：图标与品牌色 */
    var getPayTypeIconStyle = function (payTypeId) {
        switch (payTypeId) {
            case 1:
                return {icon: 'fa-cc-paypal', color: '#1677FF'};
            case 2:
                return {icon: 'fa-wechat', color: '#07C160'};
            case 3:
                return {icon: 'fa-credit-card', color: ''};
            default:
                if (payTypeId >= 4) {
                    return {icon: 'fa-shopping-bag', color: '#605ca8'};
                }
                return {icon: 'fa-credit-card', color: ''};
        }
    };

    var payTypeColumnFormatter = function (value, row) {
        var payTypeList = Config.payTypeList || {};
        var payTypeId = parseInt(value, 10);
        if (!payTypeId) {
            return '<span class="text-muted">-</span>';
        }
        var text = payTypeList[payTypeId] !== undefined ? payTypeList[payTypeId] : String(value);
        var iconStyle = getPayTypeIconStyle(payTypeId);
        var colorCss = iconStyle.color ? (' style="color:' + iconStyle.color + ';"') : '';
        return '<a href="javascript:;" class="btn-pay-type-detail" data-id="' + row.id + '" title="' + escapeHtml(__('Pay type detail')) + '"' + colorCss + '>' +
            '<i class="fa ' + iconStyle.icon + '"' + colorCss + '></i> ' + escapeHtml(text) + '</a>';
    };

    var bindAppealJudgeDetail = function (table) {
        table.closest('.panel-body, .widget-body').on('click', '.btn-appeal-judge-detail', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $btn = $(this);
            var id = $btn.data('id');
            var row = findRowById(table, id);
            if (!row && $btn.attr('data-wronger') !== undefined) {
                row = {
                    wronger: $btn.attr('data-wronger'),
                    judge: $btn.attr('data-judge') || '',
                    judge_time: parseInt($btn.attr('data-judge-time'), 10) || 0
                };
            }
            if (!row) {
                Toastr.error(__('No appeal judgment data'));
                return;
            }
            openAppealJudgeDetail(row);
        });
    };

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
                field: 'pay_type_id',
                title: __('Pay type'),
                operate: '=',
                searchList: Config.payTypeList,
                escape: false,
                formatter: payTypeColumnFormatter
            },
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
                        return '<span class="label label-default">' + __('Wronger none') + '</span>';
                    }
                    if (parseInt(row.judge_time, 10) === 0) {
                        return '<span class="label label-warning">' + __('Status appealing') + '</span>';
                    }
                    var judgeAttr = $('<div/>').text($.trim(row.judge || '')).html();
                    return '<a href="javascript:;" class="btn btn-xs btn-warning btn-appeal-judge-detail" ' +
                        'data-id="' + row.id + '" ' +
                        'data-wronger="' + (row.wronger !== undefined ? row.wronger : '') + '" ' +
                        'data-judge="' + judgeAttr + '" ' +
                        'data-judge-time="' + (parseInt(row.judge_time, 10) || 0) + '" ' +
                        'title="' + __('Appeal judgment detail') + '">' +
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
                uniqueId: 'id',
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
            bindAppealJudgeDetail(table);
            bindPayTypeDetail(table);
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
                uniqueId: 'id',
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
            bindPayTypeDetail(table);
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
