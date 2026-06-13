define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'app/notice/letter/index',
                    table: 'notice_letter',
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
                        {field: 'title', title: __('Title'), operate: 'LIKE'},
                        {
                            field: 'content',
                            title: __('Content'),
                            operate: 'LIKE',
                            formatter: function (value) {
                                value = value ? String(value) : '';
                                if (!value) {
                                    return '-';
                                }
                                var text = Fast.api.escape(value);
                                return '<span class="letter-content-text" data-toggle="tooltip" data-placement="auto" data-container="body" title="' + text + '">' + text + '</span>';
                            },
                            cellStyle: function () {
                                return {
                                    css: {
                                        'max-width': '300px',
                                        'white-space': 'nowrap',
                                        'overflow': 'hidden',
                                        'text-overflow': 'ellipsis'
                                    }
                                };
                            }
                        },
                        {
                            field: 'url',
                            title: __('Url'),
                            operate: 'LIKE',
                            formatter: Table.api.formatter.url
                        },
                        {
                            field: 'is_read',
                            title: __('Is_read'),
                            searchList: Config.isReadList,
                            formatter: function (value) {
                                return Config.isReadList[value] || value || '-';
                            },
                            operate: '='
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

            var initContentTooltip = function () {
                $('[data-toggle="tooltip"]', table).tooltip('destroy').tooltip({container: 'body'});
            };
            table.on('post-body.bs.table', initContentTooltip);
            table.on('refresh.bs.table', initContentTooltip);

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
