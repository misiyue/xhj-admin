define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'user/report/index',
                    detail_url: 'user/report/detail',
                    table: 'user_report',
                }
            });

            var table = $("#table");
            var statusList = Config.reportStatusList || {};
            var resultList = Config.reportResultList || {};

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'desc',
                columns: [
                    [
                        {field: 'id', title: __('Id'), sortable: true},
                        {
                            field: 'reporter_nickname',
                            title: __('Reporter nickname'),
                            operate: false,
                            formatter: function (value, row) {
                                var nick = value || '-';
                                if (row.user_id) {
                                    return nick + ' <span class="text-muted">(ID:' + row.user_id + ')</span>';
                                }
                                return nick;
                            }
                        },
                        {
                            field: 'defe_party_text',
                            title: __('Defe party'),
                            operate: false,
                            sortable: false
                        },
                        {
                            field: 'status',
                            title: __('Report status'),
                            operate: '=',
                            searchList: statusList,
                            formatter: function (value) {
                                var v = parseInt(value, 10);
                                if (v === 1) {
                                    return '<span class="label label-success">' + (statusList['1'] || statusList[1] || __('Processed')) + '</span>';
                                }
                                return '<span class="label label-warning">' + (statusList['0'] || statusList[0] || __('Pending')) + '</span>';
                            }
                        },
                        {
                            field: 'result',
                            title: __('Process result'),
                            operate: '=',
                            searchList: resultList,
                            formatter: function (value, row) {
                                var key = String(value);
                                var text = resultList[key] || resultList[value] || row.result_text || '-';
                                if (parseInt(value, 10) === -1) {
                                    return '<span class="label label-default">' + text + '</span>';
                                }
                                if (parseInt(value, 10) === 1) {
                                    return '<span class="label label-danger">' + text + '</span>';
                                }
                                if (parseInt(value, 10) === 2) {
                                    return '<span class="label label-warning">' + text + '</span>';
                                }
                                return text;
                            }
                        },
                        {
                            field: 'updated_at',
                            title: __('Updatetime'),
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
                                    url: 'user/report/detail'
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

            $(".btn-report-process").on("click", function () {
                var $checked = $('input[name="result"]:checked');
                if (!$checked.length) {
                    Toastr.error(__('Please select process result'));
                    return;
                }
                var ids = $("input[name='ids']").val();
                var result = $checked.val();
                Layer.confirm(__('Confirm process report'), {icon: 3, title: __('Warning')}, function (index) {
                    Layer.close(index);
                    Fast.api.ajax({
                        url: 'user/report/detail/ids/' + ids,
                        data: {
                            action: 'process',
                            result: result,
                            __token__: $("input[name='__token__']").val()
                        }
                    }, function () {
                        if (parent && parent.$) {
                            parent.$(".btn-refresh").trigger("click");
                        }
                        var frameIndex = parent.Layer.getFrameIndex(window.name);
                        parent.Layer.close(frameIndex);
                    });
                });
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
