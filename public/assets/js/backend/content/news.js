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
                            field: 'category_id',
                            title: __('Category_id'),
                            searchList: Config.categoryList,
                            formatter: function (value, row) {
                                return row.category_text || (Config.categoryList && Config.categoryList[value]) || '-';
                            },
                            operate: '='
                        },
                        {
                            field: 'type_id',
                            title: __('Type_id'),
                            searchList: Config.typeList,
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
                            field: 'is_index',
                            title: __('Is_index'),
                            searchList: Config.isIndexList,
                            formatter: Table.api.formatter.toggle,
                            yes: 1,
                            no: 0,
                            table: table,
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
            getTypeId: function (form) {
                var val = $('input[name="row[type_id]"]:checked', form).val();
                return parseInt(val, 10) || 1;
            },
            destroyEditor: function () {
                $.each(Controller.api.editors, function (id, editor) {
                    if (editor && typeof editor.destroy === 'function') {
                        try {
                            editor.destroy();
                        } catch (e) {
                        }
                    }
                });
                Controller.api.editors = {};
                // Simditor destroy 后还原 textarea 显示
                $('#c-content').show();
            },
            initEditor: function (form) {
                var $textarea = $('#c-content', form);
                if (!$textarea.length || $textarea.prop('disabled')) {
                    return;
                }
                var id = $textarea.attr('id') || 'c-content';
                if (Controller.api.editors[id]) {
                    return;
                }
                require(['css!../addons/simditor/css/simditor.min.css', 'simditor'], function (Simditor) {
                    if (!window.Simditor) {
                        window.Simditor = Simditor;
                    }
                    // 再次确认仍是图文模式
                    if (Controller.api.getTypeId(form) !== 1) {
                        return;
                    }
                    if (Controller.api.editors[id]) {
                        return;
                    }
                    var editor = new Simditor({
                        textarea: $textarea[0],
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
                }, function (err) {
                    console.error('Simditor load failed', err);
                    Toastr.error('富文本编辑器加载失败，请刷新页面重试');
                });
            },
            syncEditor: function (form) {
                if (Controller.api.getTypeId(form) !== 1) {
                    return;
                }
                $(".editor", form).each(function () {
                    var id = $(this).attr('id');
                    if (id && Controller.api.editors[id]) {
                        $(this).val(Controller.api.editors[id].getValue());
                    }
                });
            },
            switchContentByType: function (form) {
                var typeId = Controller.api.getTypeId(form);
                var $editorGroup = $('#content-editor-group', form);
                var $videoGroup = $('#content-video-group', form);
                var $textarea = $('#c-content', form);
                var $videoInput = $('#c-content-video', form);

                if (typeId === 2) {
                    // 切到视频：销毁富文本，改用输入框
                    if (Controller.api.editors['c-content']) {
                        try {
                            $videoInput.val(Controller.api.editors['c-content'].getValue());
                        } catch (e) {
                        }
                    } else if ($textarea.length && !$textarea.prop('disabled')) {
                        $videoInput.val($textarea.val());
                    }
                    Controller.api.destroyEditor();
                    $textarea.prop('disabled', true).removeAttr('name');
                    $videoInput.prop('disabled', false).attr('name', 'row[content]');
                    $editorGroup.hide();
                    $videoGroup.show();
                } else {
                    // 切到图文：启用富文本
                    if ($videoInput.attr('name') === 'row[content]') {
                        $textarea.val($videoInput.val());
                    }
                    $videoInput.prop('disabled', true).removeAttr('name');
                    $textarea.prop('disabled', false).attr('name', 'row[content]');
                    $videoGroup.hide();
                    $editorGroup.show();
                    Controller.api.initEditor(form);
                }
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
                form.off('change.newsType', 'input[name="row[type_id]"]').on('change.newsType', 'input[name="row[type_id]"]', function () {
                    Controller.api.switchContentByType(form);
                });
                Controller.api.switchContentByType(form);
                $(document).off('click.newsSimditor', '.layui-layer-footer .btn-primary').on('click.newsSimditor', '.layui-layer-footer .btn-primary', function () {
                    Controller.api.syncEditor(form);
                });
            }
        }
    };
    return Controller;
});
