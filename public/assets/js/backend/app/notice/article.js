define(['jquery', 'bootstrap', 'backend', 'table', 'form', 'upload', 'addons'], function ($, undefined, Backend, Table, Form, Upload) {

    var RICH_ID = 'c-content-rich';

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
                columns: [[
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
                ]]
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
            getForm: function () {
                var $form = $('#edit-form');
                if (!$form.length) {
                    $form = $('#add-form');
                }
                if (!$form.length) {
                    $form = $('form[role=form]').first();
                }
                return $form;
            },
            getEditor: function () {
                if (window.Simditor && Simditor.list && Simditor.list[RICH_ID]) {
                    return Simditor.list[RICH_ID];
                }
                return null;
            },
            getTextType: function ($form) {
                var val = parseInt($('#c-text_type', $form).val(), 10);
                return val === 2 ? 2 : 1;
            },
            setTextType: function ($form, textType) {
                $('#c-text_type', $form).val(textType === 2 ? 2 : 1);
            },
            updateButtons: function ($form, mode) {
                var $btns = $('.btn-editor-mode', $form);
                $btns.removeClass('btn-primary active').addClass('btn-default');
                $btns.filter('[data-mode="' + mode + '"]').removeClass('btn-default').addClass('btn-primary active');
            },
            getRichValue: function () {
                var editor = Controller.api.getEditor();
                if (editor) {
                    try {
                        return editor.getValue() || '';
                    } catch (e) {
                    }
                }
                return $('#c-content-rich').val() || '';
            },
            getPlainValue: function () {
                return $('#c-content-plain').val() || '';
            },
            setRichValue: function (value) {
                value = value == null ? '' : String(value);
                $('#c-content-rich').val(value);
                var editor = Controller.api.getEditor();
                if (editor) {
                    try {
                        editor.setValue(value);
                    } catch (e) {
                    }
                }
            },
            setSubmitValue: function (value) {
                $('#c-content').val(value == null ? '' : value);
            },
            syncToSubmit: function () {
                var value = Controller.api.editorMode === 'plain'
                    ? Controller.api.getPlainValue()
                    : Controller.api.getRichValue();
                Controller.api.setSubmitValue(value);
                return value;
            },
            showRich: function () {
                $('#content-plain-wrap').hide();
                $('#content-rich-wrap').show();
            },
            showPlain: function () {
                $('#content-rich-wrap').hide();
                $('#content-plain-wrap').show();
            },
            // 仅显示/隐藏，不销毁、不重建富文本
            switchMode: function ($form, mode) {
                mode = mode === 'plain' ? 'plain' : 'rich';
                if (mode === Controller.api.editorMode) {
                    Controller.api.updateButtons($form, mode);
                    return;
                }

                if (mode === 'plain') {
                    var richVal = Controller.api.getRichValue();
                    $('#c-content-plain').val(richVal);
                    Controller.api.setSubmitValue(richVal);
                    Controller.api.editorMode = 'plain';
                    Controller.api.setTextType($form, 2);
                    Controller.api.updateButtons($form, 'plain');
                    Controller.api.showPlain();
                } else {
                    var plainVal = Controller.api.getPlainValue();
                    Controller.api.setRichValue(plainVal);
                    Controller.api.setSubmitValue(plainVal);
                    Controller.api.editorMode = 'rich';
                    Controller.api.setTextType($form, 1);
                    Controller.api.updateButtons($form, 'rich');
                    Controller.api.showRich();
                }
            },
            bindevent: function () {
                var $form = Controller.api.getForm();
                var textType = Controller.api.getTextType($form);
                Controller.api.editorMode = textType === 2 ? 'plain' : 'rich';
                Controller.api.setTextType($form, textType);
                Controller.api.updateButtons($form, Controller.api.editorMode);

                // 富文本始终保留 editor 类，交给 addons 初始化一次
                $('#c-content-rich').addClass('editor');
                Controller.api.setSubmitValue($('#c-content').val() || $('#c-content-rich').val() || $('#c-content-plain').val() || '');

                if (Controller.api.editorMode === 'plain') {
                    Controller.api.showPlain();
                } else {
                    Controller.api.showRich();
                }

                $form.data('validator-options', $.extend({}, $form.data('validator-options') || {}, {
                    ignore: ':hidden:not(#c-content)'
                }));
                Form.api.bindevent($form, null, null, function () {
                    Controller.api.syncToSubmit();
                    return true;
                });

                // 若初始是纯文本，初始化完成后仍只显示普通框（编辑器保留在隐藏区域）
                if (Controller.api.editorMode === 'plain') {
                    setTimeout(function () {
                        Controller.api.showPlain();
                    }, 0);
                }

                $form.off('click.editorMode', '.btn-editor-mode').on('click.editorMode', '.btn-editor-mode', function (e) {
                    e.preventDefault();
                    Controller.api.switchMode($form, $(this).data('mode') || 'rich');
                    return false;
                });

                $form.off('input.articlePlain change.articlePlain', '#c-content-plain')
                    .on('input.articlePlain change.articlePlain', '#c-content-plain', function () {
                        if (Controller.api.editorMode === 'plain') {
                            Controller.api.setSubmitValue($(this).val() || '');
                        }
                    });

                $(document).off('click.articleSimditor', '.layui-layer-footer .btn-primary')
                    .on('click.articleSimditor', '.layui-layer-footer .btn-primary', function () {
                        Controller.api.syncToSubmit();
                    });
            }
        }
    };
    return Controller;
});
