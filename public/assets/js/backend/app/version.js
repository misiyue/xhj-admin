define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'app/version/index',
                    add_url: 'app/version/add',
                    edit_url: 'app/version/edit',
                    del_url: 'app/version/del',
                    multi_url: 'app/version/multi',
                    table: 'app_version',
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
                        {
                            field: 'platform',
                            title: __('Platform'),
                            searchList: Config.platformList,
                            formatter: Table.api.formatter.normal,
                            operate: '='
                        },
                        {field: 'channel', title: __('Channel'), operate: 'LIKE'},
                        {field: 'latest_version_name', title: __('Latest_version_name'), operate: 'LIKE', sortable: true},
                        {
                            field: 'upgrade_type',
                            title: __('Upgrade_type'),
                            searchList: Config.upgradeTypeList,
                            formatter: Table.api.formatter.normal,
                            operate: '='
                        },
                        {field: 'title', title: __('Title'), operate: 'LIKE'},
                        {
                            field: 'release_notes',
                            title: __('Release_notes'),
                            operate: false,
                            formatter: Controller.api.formatter.jsonPreview
                        },
                        {
                            field: 'published_at',
                            title: __('Published_at'),
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
            },
            formatter: {
                jsonPreview: function (value) {
                    if (value === null || value === undefined || value === '') {
                        return '';
                    }
                    var s = typeof value === 'string' ? value : JSON.stringify(value);
                    if (s.length > 72) {
                        s = s.substring(0, 72) + '...';
                    }
                    return $('<div>').text(s).html();
                }
            }
        }
    };
    return Controller;
});
