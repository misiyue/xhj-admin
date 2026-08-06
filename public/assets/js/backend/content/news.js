define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'addons'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'content/news/index',
                    add_url: 'content/news/add',
                    edit_url: 'content/news/edit',
                    del_url: 'content/news/del',
                    multi_url: 'content/news/multi',
                    table: 'app_news',
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
                        {field: 'title', title: __('Title'), operate: 'LIKE', align: 'left'},
                        {
                            field: 'cover',
                            title: __('Cover'),
                            events: Table.api.events.image,
                            formatter: Table.api.formatter.image,
                            operate: false
                        },
                        {
                            field: 'collect_type',
                            title: __('Collect_type'),
                            searchList: Config.collectTypeList,
                            formatter: Table.api.formatter.normal,
                            operate: '='
                        },
                        {
                            field: 'news_type',
                            title: __('News_type'),
                            searchList: Config.newsTypeList,
                            formatter: Table.api.formatter.normal,
                            operate: '='
                        },
                        {
                            field: 'source',
                            title: __('Source'),
                            searchList: Config.sourceList,
                            formatter: Table.api.formatter.normal,
                            operate: '='
                        },
                        {
                            field: 'source_url',
                            title: __('Source_url'),
                            operate: 'LIKE',
                            formatter: Table.api.formatter.url
                        },
                        {
                            field: 'status',
                            title: __('Status'),
                            searchList: Config.statusList,
                            formatter: Table.api.formatter.status,
                            operate: '='
                        },
                        {
                            field: 'upload_time',
                            title: __('Upload_time'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true,
                            width: 160
                        },
                        {
                            field: 'publish_time',
                            title: __('Publish_time'),
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
                            width: 160,
                            visible: false
                        },
                        {
                            field: 'updated_at',
                            title: __('Updatetime'),
                            operate: 'RANGE',
                            addclass: 'datetimerange',
                            formatter: Table.api.formatter.datetime,
                            sortable: true,
                            width: 160,
                            visible: false
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
            syncEditor: function (form) {
                if (!window.Simditor || !Simditor.list) {
                    return;
                }
                $(".editor", form).each(function () {
                    var id = $(this).attr('id');
                    if (id && Simditor.list[id]) {
                        $(this).val(Simditor.list[id].getValue());
                    }
                });
            },
            bindevent: function () {
                var form = $("form[role=form]");
                form.data('validator-options', $.extend({}, form.data('validator-options') || {}, {
                    ignore: ':hidden:not(.editor)'
                }));
                Form.api.bindevent(form, null, null, function () {
                    Controller.api.syncEditor(form);
                    return true;
                });
                $(document).off('click.newsSimditor', '.layui-layer-footer .btn-primary').on('click.newsSimditor', '.layui-layer-footer .btn-primary', function () {
                    Controller.api.syncEditor(form);
                });
            }
        }
    };
    return Controller;
});
