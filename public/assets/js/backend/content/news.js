define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'upload'], function ($, undefined, Backend, Table, Form, Upload) {

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
            editors: {},
            initEditor: function (form) {
                var $editors = $('.editor', form);
                if (!$editors.length) {
                    return;
                }
                require(['css!../addons/simditor/css/simditor.min.css', 'simditor'], function (Simditor) {
                    if (!window.Simditor) {
                        window.Simditor = Simditor;
                    }
                    $editors.each(function () {
                        var $textarea = $(this);
                        var id = $textarea.attr('id') || ('editor-' + Math.random().toString(36).slice(2));
                        $textarea.attr('id', id);
                        if (Controller.api.editors[id]) {
                            return;
                        }
                        var editor = new Simditor({
                            textarea: this,
                            height: 300,
                            minHeight: 250,
                            toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'],
                            mobileToolbar: ['bold', 'underline', 'strikethrough', 'color', 'ul', 'ol'],
                            toolbarFloat: false,
                            placeholder: '',
                            pasteImage: true,
                            defaultImage: (Config.__CDN__ || '') + '/assets/addons/simditor/images/image.png',
                            upload: {url: '/'}
                        });

                        var $selectImage = editor.toolbar.wrapper.find('.menu-item-select-image');
                        if ($selectImage.length) {
                            $selectImage.on('click', function () {
                                parent.Fast.api.open('general/attachment/select?element_id=&multiple=true&mimetype=image/', __('Choose'), {
                                    callback: function (data) {
                                        $.each((data.url || '').split(/,/), function () {
                                            if (!this) {
                                                return;
                                            }
                                            editor.insertHTML('<img src="' + Fast.api.cdnurl(this, true) + '" />');
                                        });
                                    }
                                });
                                return false;
                            });
                        }

                        editor.uploader.on('beforeupload', function (e, file) {
                            Upload.api.send(file.obj, function (data) {
                                editor.uploader.trigger('uploadsuccess', [file, {
                                    success: true,
                                    file_path: Fast.api.cdnurl(data.url, true)
                                }]);
                            });
                            return false;
                        });

                        var syncValue = function () {
                            $textarea.val(editor.getValue());
                        };
                        editor.on('blur', function () {
                            syncValue();
                            $textarea.trigger('blur');
                        });
                        editor.on('valuechanged', syncValue);
                        editor.body.css({height: 300, 'min-height': 250, 'overflow-y': 'auto'});
                        Controller.api.editors[id] = editor;
                    });
                }, function (err) {
                    console.error('Simditor load failed', err);
                    Toastr.error('富文本编辑器加载失败，请刷新页面重试');
                });
            },
            syncEditor: function (form) {
                $(".editor", form).each(function () {
                    var id = $(this).attr('id');
                    if (id && Controller.api.editors[id]) {
                        $(this).val(Controller.api.editors[id].getValue());
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
                Controller.api.initEditor(form);
                $(document).off('click.newsSimditor', '.layui-layer-footer .btn-primary').on('click.newsSimditor', '.layui-layer-footer .btn-primary', function () {
                    Controller.api.syncEditor(form);
                });
            }
        }
    };
    return Controller;
});
