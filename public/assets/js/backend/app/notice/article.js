define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'app/notice/article/index',
                    add_url: 'app/notice/article/add',
                    edit_url: 'app/notice/article/edit',
                    multi_url: 'app/notice/article/multi',
                    table: 'notice_article',
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
                        {field: 'title', title: __('Title'), operate: 'LIKE'},
                        {
                            field: 'status',
                            title: __('Status'),
                            searchList: Config.statusList,
                            formatter: Table.api.formatter.toggle,
                            yes: 1,
                            no: 0,
                            table: table,
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
                var form = $("form[role=form]");
                form.data('validator-options', $.extend({}, form.data('validator-options') || {}, {
                    ignore: ':hidden:not(.editor)'
                }));
                Form.api.bindevent(form, null, null, function () {
                    $(".editor", form).each(function () {
                        var id = $(this).attr("id");
                        if (window.Simditor && Simditor.list && Simditor.list[id]) {
                            $(this).val(Simditor.list[id].getValue());
                        }
                    });
                    return true;
                });
            }
        }
    };
    return Controller;
});
