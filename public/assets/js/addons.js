define([], function () {
    require.config({
    paths: {
        'simditor': '../addons/simditor/js/simditor',
        'simple-module': '../addons/simditor/js/module',
        'simple-hotkeys': '../addons/simditor/js/hotkeys',
        'simple-uploader': '../addons/simditor/js/uploader',
        'dompurify': '../addons/simditor/js/dompurify',
    },
    shim: {
        'simditor': [
            'css!../addons/simditor/css/simditor.min.css',
        ]
    }
});
require(['form', 'upload'], function (Form, Upload) {
    var defaultToolbar = ['title', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'];
    var defaultMobileToolbar = ['bold', 'underline', 'strikethrough', 'color', 'ul', 'ol'];

    var getSimditorConfig = function () {
        return $.extend({
            classname: '.editor',
            height: '300',
            minHeight: 250,
            toolbarFloat: 0,
            toolbar: defaultToolbar,
            mobileToolbar: defaultMobileToolbar,
            placeholder: '',
            isdompurify: 0,
            allowiframeprefixs: []
        }, typeof Config !== 'undefined' && Config.simditor ? Config.simditor : {});
    };

    var _bindevent = Form.events.bindevent;
    Form.events.bindevent = function (form) {
        _bindevent.apply(this, [form]);
        var cfg = getSimditorConfig();
        if ($(cfg.classname || '.editor', form).length === 0) {
            return;
        }
        require(['simditor', 'dompurify'], function (Simditor, DOMPurify) {
            if (!window.Simditor) {
                window.Simditor = Simditor;
            }
            if (!Simditor.list) {
                Simditor.list = {};
            }
            Simditor.locale = 'zh-CN';

            if (cfg.isdompurify) {
                DOMPurify.addHook('uponSanitizeElement', function (node, data) {
                    if (data.tagName === 'iframe') {
                        var allowedIframePrefixes = cfg.allowiframeprefixs || [];
                        var src = node.getAttribute('src');
                        var isAllowed = false;
                        for (var i = 0; i < allowedIframePrefixes.length; i++) {
                            if (src && src.indexOf(allowedIframePrefixes[i]) === 0) {
                                isAllowed = true;
                                break;
                            }
                        }
                        if (!isAllowed) {
                            return node.parentNode.removeChild(node);
                        }
                        node.setAttribute('allowfullscreen', '');
                        node.setAttribute('allow', 'fullscreen');
                    }
                });
            }

            $(cfg.classname || '.editor', form).each(function () {
                var $textarea = $(this);
                var id = $textarea.attr('id') || ('editor-' + Math.random().toString(36).slice(2));
                $textarea.attr('id', id);
                if (Simditor.list[id]) {
                    return;
                }
                var editor = new Simditor({
                    textarea: this,
                    height: isNaN(parseInt(cfg.height, 10)) ? null : parseInt(cfg.height, 10),
                    minHeight: parseInt(cfg.minHeight || 250, 10),
                    toolbar: (cfg.toolbar && cfg.toolbar.length) ? cfg.toolbar : defaultToolbar,
                    mobileToolbar: (cfg.mobileToolbar && cfg.mobileToolbar.length) ? cfg.mobileToolbar : defaultMobileToolbar,
                    toolbarFloat: parseInt(cfg.toolbarFloat, 10) || 0,
                    placeholder: cfg.placeholder || '',
                    dompurify: {
                        enabled: !!cfg.isdompurify,
                        options: {ADD_TAGS: ['iframe'], FORCE_REJECT_IFRAME: false}
                    },
                    pasteImage: true,
                    defaultImage: (Config.__CDN__ || '') + '/assets/addons/simditor/images/image.png',
                    upload: {url: '/'}
                });
                var $selectImage = editor.toolbar.wrapper.find('.menu-item-select-image');
                if ($selectImage.length) {
                    $selectImage.on('click', function () {
                        var selectUrl = typeof Config !== 'undefined' && Config.modulename === 'index' ? 'user/attachment' : 'general/attachment/select';
                        parent.Fast.api.open(selectUrl + '?element_id=&multiple=true&mimetype=image/', __('Choose'), {
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
                if (editor.opts.height) {
                    editor.body.css({height: editor.opts.height, 'overflow-y': 'auto'});
                }
                if (editor.opts.minHeight) {
                    editor.body.css({'min-height': editor.opts.minHeight});
                }
                Simditor.list[id] = editor;
            });
        });
    };
});

});