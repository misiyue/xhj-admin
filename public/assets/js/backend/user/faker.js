define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'user/faker/index',
                    add_url: 'user/faker/add',
                    edit_url: 'user/faker/edit',
                    del_url: 'user/faker/del',
                    multi_url: 'user/faker/multi',
                    table: 'user_faker',
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
                        {checkbox: true},
                        {field: 'id', title: __('Id'), sortable: true},
                        {field: 'user_id', title: __('User_id'), operate: '='},
                        {field: 'username', title: __('Username'), operate: 'LIKE'},
                        {field: 'nickname', title: __('Nickname'), operate: 'LIKE'},
                        {
                            field: 'avatar',
                            title: __('Avatar'),
                            events: Table.api.events.image,
                            formatter: Table.api.formatter.image,
                            operate: false
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
