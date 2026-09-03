define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'upload', 'addons'], function ($, undefined, Backend, Table, Form, Upload) {

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
                        {field: 'code', title: __('Code'), operate: 'LIKE'},
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
            editorMode: 'rich',
            syncEditor: function (form) {
                if (Controller.api.editorMode !== 'rich') {
                    return;
                }
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
            destroyEditor: function (form) {
                var $textarea = $('#c-content', form);
                var id = $textarea.attr('id');
                if (!id || !window.Simditor || !Simditor.list || !Simditor.list[id]) {
                    $textarea.show();
                    return;
                }
                try {
                    $textarea.val(Simditor.list[id].getValue());
                    Simditor.list[id].destroy();
                } catch (e) {
                }
                delete Simditor.list[id];
                $textarea.show().css({display: 'block', visibility: 'visible'});
            },
            initEditor: function (form) {
                var $textarea = $('#c-content', form);
                if (!$textarea.length) {
                    return;
                }
                var id = $textarea.attr('id') || 'c-content';
                $textarea.attr('id', id).addClass('editor');
                if (window.Simditor && Simditor.list && Simditor.list[id]) {
                    return;
                }
                require(['css!../addons/simditor/css/simditor.min.css', 'simditor'], function (Simditor) {
                    if (Controller.api.editorMode !== 'rich') {
                        return;
                    }
                    if (!window.Simditor) {
                        window.Simditor = Simditor;
                    }
                    if (!Simditor.list) {
                        Simditor.list = {};
                    }
                    if (Simditor.list[id]) {
                        return;
                    }
                    var cfg = $.extend({
                        height: 250,
                        minHeight: 250,
                        toolbarFloat: 0,
                        toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'],
                        mobileToolbar: ['bold', 'underline', 'strikethrough', 'color', 'ul', 'ol'],
                        placeholder: ''
                    }, (Config && Config.simditor) ? Config.simditor : {});

                    var editor = new Simditor({
                        textarea: $textarea[0],
                        height: parseInt(cfg.height, 10) || 250,
                        minHeight: parseInt(cfg.minHeight, 10) || 250,
                        toolbar: cfg.toolbar,
                        mobileToolbar: cfg.mobileToolbar,
                        toolbarFloat: !!parseInt(cfg.toolbarFloat, 10),
                        placeholder: cfg.placeholder || '',
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
                    if (editor.uploader) {
                        editor.uploader.on('beforeupload', function (e, file) {
                            Upload.api.send(file.obj, function (data) {
                                editor.uploader.trigger('uploadsuccess', [file, {
                                    success: true,
                                    file_path: Fast.api.cdnurl(data.url, true)
                                }]);
                            });
                            return false;
                        });
                    }
                    var syncValue = function () {
                        $textarea.val(editor.getValue());
                    };
                    editor.on('blur', function () {
                        syncValue();
                        $textarea.trigger('blur');
                    });
                    editor.on('valuechanged', syncValue);
                    editor.body.css({height: editor.opts.height, 'min-height': editor.opts.minHeight, 'overflow-y': 'auto'});
                    Simditor.list[id] = editor;
                });
            },
            switchEditorMode: function (form, mode) {
                var $btns = $('.btn-editor-mode', form);
                $btns.removeClass('btn-primary active').addClass('btn-default');
                $btns.filter('[data-mode="' + mode + '"]').removeClass('btn-default').addClass('btn-primary active');
                Controller.api.editorMode = mode;
                if (mode === 'plain') {
                    Controller.api.destroyEditor(form);
                    $('#c-content', form).removeClass('editor').attr('rows', 12);
                } else {
                    $('#c-content', form).addClass('editor');
                    Controller.api.initEditor(form);
                }
            },
            bindEditorToggle: function (form) {
                form.off('click.editorMode', '.btn-editor-mode').on('click.editorMode', '.btn-editor-mode', function () {
                    var mode = $(this).data('mode') || 'rich';
                    if (mode === Controller.api.editorMode) {
                        return;
                    }
                    Controller.api.switchEditorMode(form, mode);
                });
            },
            bindevent: function () {
                var form = $("form[role=form]");
                Controller.api.editorMode = 'rich';
                // 先去掉 editor class，避免 addons 自动初始化；由本页可控初始化
                $('#c-content', form).removeClass('editor');
                form.data('validator-options', $.extend({}, form.data('validator-options') || {}, {
                    ignore: ':hidden:not(#c-content)'
                }));
                Form.api.bindevent(form, null, null, function () {
                    Controller.api.syncEditor(form);
                    return true;
                });
                Controller.api.initEditor(form);
                Controller.api.bindEditorToggle(form);
                $(document).off('click.articleSimditor', '.layui-layer-footer .btn-primary').on('click.articleSimditor', '.layui-layer-footer .btn-primary', function () {
                    Controller.api.syncEditor(form);
                });
            }
        }
    };
    return Controller;
});
