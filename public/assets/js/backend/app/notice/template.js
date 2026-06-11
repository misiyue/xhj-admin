define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'app/notice/template/index',
                    edit_url: 'app/notice/template/edit',
                    table: 'notice_template',
                }
            });

            var table = $("#table");

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'asc',
                columns: [
                    [
                        {field: 'id', title: __('Id'), sortable: true},
                        {
                            field: 'flag',
                            title: __('Flag'),
                            searchList: Config.flagList,
                            formatter: function (value) {
                                return Config.flagList[value] || value || '-';
                            },
                            operate: '='
                        },
                        {field: 'title', title: __('Title'), operate: 'LIKE'},
                        {field: 'subtitle', title: __('Subtitle'), operate: 'LIKE'},
                        {field: 'content', title: __('Content'), operate: 'LIKE'},
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
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            formatter: Table.api.formatter.operate
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        edit: function () {
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
