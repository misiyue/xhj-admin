define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'group/totop/index',
                    add_url: 'group/totop/add',
                    edit_url: 'group/totop/edit',
                    del_url: 'group/totop/del',
                    multi_url: 'group/totop/multi',
                    table: 'group_totop',
                }
            });

            var table = $("#table");

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'sort',
                sortOrder: 'desc',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id'), sortable: true},
                        {
                            field: 'cover',
                            title: __('Cover'),
                            events: Table.api.events.image,
                            formatter: Table.api.formatter.image,
                            operate: false
                        },
                        {field: 'title', title: __('Title'), operate: 'LIKE'},
                        {field: 'btn', title: __('Btn'), operate: 'LIKE'},
                        {
                            field: 'url',
                            title: __('Url'),
                            operate: 'LIKE',
                            formatter: Table.api.formatter.url
                        },
                        {field: 'group_ids', title: __('Group_ids'), operate: 'LIKE'},
                        {field: 'sort', title: __('Sort'), sortable: true, operate: 'BETWEEN'},
                        {
                            field: 'created_at',
                            title: __('Createtime'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true
                        },
                        {
                            field: 'updated_at',
                            title: __('Updatetime'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true
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
        add: function () {
            Controller.api.bindevent();
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
