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
                            field: 'text_type',
                            title: __('Text type'),
                            operate: '=',
                            searchList: Config.textTypeList,
                            formatter: Table.api.formatter.normal
                        },
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
            contentCache: '',
            initializing: false,
            getTextarea: function (form) {
                return $('#c-content', form);
            },
            getEditorId: function (form) {
                var $textarea = Controller.api.getTextarea(form);
                var id = $textarea.attr('id') || 'c-content';
                $textarea.attr('id', id);
                return id;
            },
            getTextType: function (form) {
                var val = parseInt($('#c-text_type', form).val(), 10);
                return val === 2 ? 2 : 1;
            },
            setTextType: function (form, textType) {
                $('#c-text_type', form).val(textType === 2 ? 2 : 1);
            },
            modeFromTextType: function (textType) {
                return parseInt(textType, 10) === 2 ? 'plain' : 'rich';
            },
            textTypeFromMode: function (mode) {
                return mode === 'plain' ? 2 : 1;
            },
            readContent: function (form) {
                var $textarea = Controller.api.getTextarea(form);
                var id = Controller.api.getEditorId(form);
                if (Controller.api.editorMode === 'rich' && window.Simditor && Simditor.list && Simditor.list[id]) {
                    try {
                        Controller.api.contentCache = Simditor.list[id].getValue();
                        $textarea.val(Controller.api.contentCache);
                        return Controller.api.contentCache;
                    } catch (e) {
                    }
                }
                Controller.api.contentCache = $textarea.val() || Controller.api.contentCache || '';
                return Controller.api.contentCache;
            },
            writeContent: function (form, content) {
                content = content == null ? '' : String(content);
                Controller.api.contentCache = content;
                Controller.api.getTextarea(form).val(content);
            },
            cleanupDom: function (form) {
                var $textarea = Controller.api.getTextarea(form);
                // 清理残留的 simditor 外壳
                $textarea.siblings('.simditor').remove();
                $textarea.prev('.simditor').remove();
                $textarea.next('.simditor').remove();
                $textarea.parent().children('.simditor').each(function () {
                    if (!$(this).find($textarea).length) {
                        $(this).remove();
                    }
                });
                $textarea.removeClass('editor').show().css({
                    display: 'block',
                    visibility: 'visible',
                    width: '100%',
                    height: 'auto',
                    minHeight: '200px',
                    opacity: 1
                });
            },
            syncEditor: function (form) {
                Controller.api.readContent(form);
            },
            destroyEditor: function (form) {
                var content = Controller.api.readContent(form);
                var id = Controller.api.getEditorId(form);
                if (window.Simditor && Simditor.list && Simditor.list[id]) {
                    try {
                        Simditor.list[id].destroy();
                    } catch (e) {
                    }
                    try {
                        delete Simditor.list[id];
                    } catch (e2) {
                        Simditor.list[id] = null;
                    }
                }
                Controller.api.cleanupDom(form);
                Controller.api.writeContent(form, content);
                Controller.api.getTextarea(form).attr('rows', 12);
            },
            initEditor: function (form) {
                if (Controller.api.initializing || Controller.api.editorMode !== 'rich') {
                    return;
                }
                var $textarea = Controller.api.getTextarea(form);
                if (!$textarea.length) {
                    return;
                }
                var id = Controller.api.getEditorId(form);
                var content = Controller.api.readContent(form);

                // 已有实例时只同步内容，不重复创建
                if (window.Simditor && Simditor.list && Simditor.list[id]) {
                    try {
                        Simditor.list[id].setValue(content);
                    } catch (e) {
                    }
                    return;
                }

                Controller.api.cleanupDom(form);
                Controller.api.writeContent(form, content);
                $textarea.addClass('editor');
                Controller.api.initializing = true;

                require(['simditor'], function (Simditor) {
                    Controller.api.initializing = false;
                    if (Controller.api.editorMode !== 'rich') {
                        Controller.api.cleanupDom(form);
                        Controller.api.writeContent(form, Controller.api.contentCache);
                        return;
                    }
                    if (!Simditor) {
                        return;
                    }
                    if (!window.Simditor) {
                        window.Simditor = Simditor;
                    }
                    if (!Simditor.list) {
                        Simditor.list = {};
                    }
                    // 异步回来时再次清理，防止重复实例
                    if (Simditor.list[id]) {
                        try {
                            Simditor.list[id].destroy();
                        } catch (e) {
                        }
                        delete Simditor.list[id];
                    }
                    Controller.api.cleanupDom(form);
                    $textarea = Controller.api.getTextarea(form).addClass('editor');
                    Controller.api.writeContent(form, Controller.api.contentCache);

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

                    // 强制写回缓存内容，避免初始化后变空
                    try {
                        editor.setValue(Controller.api.contentCache || '');
                    } catch (e) {
                    }

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
                        try {
                            Controller.api.contentCache = editor.getValue();
                            $textarea.val(Controller.api.contentCache);
                        } catch (e) {
                        }
                    };
                    editor.on('blur', function () {
                        syncValue();
                        $textarea.trigger('blur');
                    });
                    editor.on('valuechanged', syncValue);
                    if (editor.opts.height) {
                        editor.body.css({height: editor.opts.height, 'overflow-y': 'auto'});
                    }
                    if (editor.opts.minHeight) {
                        editor.body.css({'min-height': editor.opts.minHeight});
                    }
                    Simditor.list[id] = editor;
                });
            },
            updateModeButtons: function (form, mode) {
                var $btns = $('.btn-editor-mode', form);
                $btns.removeClass('btn-primary active').addClass('btn-default');
                $btns.filter('[data-mode="' + mode + '"]').removeClass('btn-default').addClass('btn-primary active');
            },
            switchEditorMode: function (form, mode) {
                // 切换前先固化当前内容
                Controller.api.readContent(form);
                Controller.api.updateModeButtons(form, mode);
                Controller.api.editorMode = mode;
                Controller.api.setTextType(form, Controller.api.textTypeFromMode(mode));
                if (mode === 'plain') {
                    Controller.api.destroyEditor(form);
                } else {
                    Controller.api.initEditor(form);
                }
            },
            bindEditorToggle: function (form) {
                form.off('click.editorMode', '.btn-editor-mode').on('click.editorMode', '.btn-editor-mode', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var mode = $(this).data('mode') || 'rich';
                    // 即使状态异常也允许强制切换，避免卡死
                    Controller.api.switchEditorMode(form, mode);
                });
            },
            bindevent: function () {
                var form = $("form[role=form]");
                var textType = Controller.api.getTextType(form);
                var mode = Controller.api.modeFromTextType(textType);

                // 禁止 addons 自动初始化，完全由本页控制，避免竞态
                var $textarea = Controller.api.getTextarea(form).removeClass('editor');
                Controller.api.contentCache = $textarea.val() || '';
                Controller.api.editorMode = mode;
                Controller.api.setTextType(form, textType);
                Controller.api.updateModeButtons(form, mode);

                form.data('validator-options', $.extend({}, form.data('validator-options') || {}, {
                    ignore: ':hidden:not(#c-content)'
                }));
                Form.api.bindevent(form, null, null, function () {
                    Controller.api.syncEditor(form);
                    return true;
                });

                if (mode === 'rich') {
                    Controller.api.initEditor(form);
                } else {
                    Controller.api.cleanupDom(form);
                    Controller.api.writeContent(form, Controller.api.contentCache);
                    $textarea.attr('rows', 12);
                }

                Controller.api.bindEditorToggle(form);
                $(document).off('click.articleSimditor', '.layui-layer-footer .btn-primary').on('click.articleSimditor', '.layui-layer-footer .btn-primary', function () {
                    Controller.api.syncEditor(form);
                });
            }
        }
    };
    return Controller;
});
