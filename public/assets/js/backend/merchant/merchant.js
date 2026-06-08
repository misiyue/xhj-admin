define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            var formatPayTypes = function (value, row) {
                if (row && $.isArray(row.pay_types_labels) && row.pay_types_labels.length) {
                    var html = '';
                    $.each(row.pay_types_labels, function (i, label) {
                        html += '<span class="label label-info" style="margin-right:4px;margin-bottom:2px;display:inline-block;">'
                            + Fast.api.escape(label) + '</span>';
                    });
                    return html;
                }
                return '<span class="text-muted">-</span>';
            };

            Table.api.init({
                extend: {
                    index_url: 'merchant/merchant/index',
                    edit_url: 'merchant/merchant/edit',
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
                            field: 'pay_types',
                            title: __('Enabled pay types'),
                            operate: false,
                            escape: false,
                            formatter: formatPayTypes
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
                                    name: 'edit',
                                    text: __('Edit'),
                                    title: __('Edit enabled pay types'),
                                    classname: 'btn btn-xs btn-success btn-dialog',
                                    icon: 'fa fa-pencil',
                                    url: 'merchant/merchant/edit'
                                }
                            ],
                            formatter: Table.api.formatter.operate
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        edit: function () {
            var $form = $("#edit-form");

            var $hdPayTypeInput = $form.find('#pay-types-hd-pay-type');

            var getHdQuotaValue = function () {
                return $.trim($hdPayTypeInput.val() || '');
            };

            var setHdQuotaValue = function (value) {
                value = $.trim(value || '');
                $hdPayTypeInput.val(value);
                $form.find('.quota-pill').removeClass('active');
                if (value) {
                    $form.find('.quota-pill[data-value="' + value + '"]').addClass('active');
                }
            };

            var syncPayTypeCards = function () {
                $form.find('.pay-type-card').each(function () {
                    var $card = $(this);
                    var checked = $card.find('.pay-type-enable').is(':checked');
                    $card.toggleClass('active', checked);
                    var $extra = $card.find('.pay-type-extra');
                    if ($extra.length) {
                        if (checked) {
                            $extra.stop(true, true).slideDown(180);
                        } else {
                            $extra.stop(true, true).slideUp(150);
                            setHdQuotaValue('');
                        }
                    }
                });
            };

            $form.on('change', '.pay-type-enable', syncPayTypeCards);
            $form.on('click', '.quota-pill', function () {
                setHdQuotaValue($(this).data('value'));
            });
            syncPayTypeCards();
            if ($form.find('.pay-type-enable[data-code="hd"]').is(':checked') && !getHdQuotaValue()) {
                var $firstPill = $form.find('.quota-pill').first();
                if ($firstPill.length) {
                    setHdQuotaValue($firstPill.data('value'));
                }
            } else {
                setHdQuotaValue(getHdQuotaValue());
            }

            Form.api.bindevent($form, function () {
                if ($form.find('.pay-type-enable[data-code="hd"]').is(':checked') && !getHdQuotaValue()) {
                    Layer.msg(__('Hd pay type required'));
                    return false;
                }
                parent.$(".btn-refresh").trigger("click");
                var index = parent.Layer.getFrameIndex(window.name);
                parent.Layer.close(index);
                return false;
            });
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
