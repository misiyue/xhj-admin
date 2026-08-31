define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var endsLabel = function (value) {
        if (!value) {
            return '-';
        }
        var list = Config.endsList || {};
        var parts = String(value).split(',');
        var html = [];
        $.each(parts, function (i, part) {
            part = $.trim(part);
            if (!part) {
                return;
            }
            html.push('<span class="label label-info">' + (list[part] || part) + '</span> ');
        });
        return html.length ? html.join('') : '-';
    };

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'app/explore/index',
                    add_url: 'app/explore/add',
                    edit_url: 'app/explore/edit',
                    del_url: 'app/explore/del',
                    table: 'app_explore',
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
                        {field: 'title', title: __('Title'), operate: 'LIKE'},
                        {
                            field: 'image',
                            title: __('Image'),
                            events: Table.api.events.image,
                            formatter: Table.api.formatter.image,
                            operate: false
                        },
                        {field: 'digest', title: __('Digest'), operate: 'LIKE'},
                        {
                            field: 'url',
                            title: __('Url'),
                            operate: 'LIKE',
                            formatter: Table.api.formatter.url
                        },
                        {
                            field: 'position',
                            title: __('Position'),
                            searchList: Config.positionList,
                            formatter: Table.api.formatter.normal,
                            operate: '='
                        },
                        {
                            field: 'ends',
                            title: __('Ends'),
                            operate: 'LIKE',
                            formatter: endsLabel
                        },
                        {
                            field: 'sort',
                            title: __('Sort'),
                            operate: 'BETWEEN',
                            sortable: true,
                            width: 90
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
