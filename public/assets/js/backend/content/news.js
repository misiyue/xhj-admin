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
                        Controller.api.uploadOssFile(file.obj, 'image', function (data) {
                            editor.uploader.trigger('uploadsuccess', [file, {
                                success: true,
                                file_path: data.fullurl || data.url || ''
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
            getVideoUrl: function (form) {
                var $videoInput = $('#c-content-video', form);
                if ($videoInput.attr('name') === 'row[content]') {
                    return $.trim($videoInput.val() || '');
                }
                return $.trim($('#c-content', form).val() || '');
            },
            /**
             * 上传文件至 OSS（资讯专用）
             */
            uploadOssFile: function (file, type, onSuccess, onError) {
                var formData = new FormData();
                formData.append('file', file);
                var uploadUrl = (Config.newsOss && Config.newsOss.imageUploadUrl) || 'content/news/uploadOssImage';
                if (type === 'video') {
                    uploadUrl = (Config.newsOss && Config.newsOss.videoUploadUrl) || 'content/news/uploadOssVideo';
                }
                Fast.api.ajax({
                    url: Fast.api.fixurl(uploadUrl),
                    data: formData,
                    processData: false,
                    contentType: false,
                }, function (data) {
                    if (typeof onSuccess === 'function') {
                        onSuccess(data || {});
                    }
                }, onError);
            },
            /**
             * 校验本地选择的视频文件
             */
            isVideoFile: function (file) {
                if (!file) {
                    return false;
                }
                var name = (file.name || '').toLowerCase();
                var ext = name.indexOf('.') > -1 ? name.split('.').pop() : '';
                var allowedExt = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', '3gp'];
                if (ext && allowedExt.indexOf(ext) === -1) {
                    return false;
                }
                if (file.type && file.type.indexOf('video/') !== 0) {
                    return false;
                }
                return true;
            },
            bindVideoUpload: function (form) {
                form.off('click.newsVideoUpload', '#btn-upload-content-video').on('click.newsVideoUpload', '#btn-upload-content-video', function () {
                    $('#file-content-video', form).val('').trigger('click');
                });
                form.off('change.newsVideoUpload', '#file-content-video').on('change.newsVideoUpload', '#file-content-video', function () {
                    var file = this.files && this.files[0];
                    if (!file) {
                        return;
                    }
                    if (!Controller.api.isVideoFile(file)) {
                        Toastr.error('请选择有效的视频文件（mp4、webm、mov 等）');
                        $(this).val('');
                        return;
                    }
                    var loading = Layer.msg(__('Uploading'), {icon: 16, time: 0, shade: 0.1});
                    Controller.api.uploadOssFile(file, 'video', function (data) {
                        Layer.close(loading);
                        var url = data.fullurl || data.url || '';
                        if (!url) {
                            Toastr.error('上传成功但未返回链接');
                            return;
                        }
                        $('#c-content-video', form).val(url).trigger('change');
                        form.data('previewVideoUrlChanged', true);
                        form.data('coverManual', false);
                        Controller.api.updateVideoPreview(form);
                        Toastr.success(__('Uploaded successful'));
                    }, function () {
                        Layer.close(loading);
                    });
                    $(this).val('');
                });
            },
            /**
             * 校验是否为可播放的视频链接（http(s) 或站点相对路径）
             */
            isPlayableVideoUrl: function (url) {
                url = $.trim(url || '');
                if (!url) {
                    return false;
                }
                if (/^https?:\/\/[^\s<>"']+$/i.test(url)) {
                    return true;
                }
                if (/^\/[\w\-./%]+$/i.test(url)) {
                    return true;
                }
                return false;
            },
            clearVideoPreview: function (form) {
                var $wrap = $('#video-preview-wrap', form);
                var $video = $('#c-content-video-preview', form);
                if ($video.length) {
                    try {
                        $video[0].pause();
                    } catch (e) {
                    }
                    $video.removeAttr('src');
                    $video.find('source').remove();
                    $video[0].load();
                }
                $wrap.hide();
            },
            /**
             * 根据输入更新视频预览
             */
            updateVideoPreview: function (form) {
                var $wrap = $('#video-preview-wrap', form);
                var $video = $('#c-content-video-preview', form);
                var $input = $('#c-content-video', form);
                if (!$wrap.length || !$video.length || !$input.length) {
                    return;
                }
                if (Controller.api.getTypeId(form) !== 2) {
                    Controller.api.clearVideoPreview(form);
                    return;
                }
                var url = $.trim($input.val() || '');
                if (!Controller.api.isPlayableVideoUrl(url)) {
                    Controller.api.clearVideoPreview(form);
                    return;
                }
                var playUrl = (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) ? url : Fast.api.cdnurl(url, true);
                var videoEl = $video[0];
                var sameOrigin = playUrl.indexOf(location.origin) === 0 || !/^https?:\/\//i.test(playUrl);
                if (!sameOrigin) {
                    videoEl.crossOrigin = 'anonymous';
                } else {
                    videoEl.removeAttribute('crossOrigin');
                }
                var current = $video.attr('src') || '';
                if (current === playUrl) {
                    $wrap.show();
                    if (videoEl.readyState >= 2) {
                        Controller.api.autoFillCoverFromPreview(form);
                    }
                    return;
                }
                if (form.data('previewVideoUrl') !== url) {
                    form.data('previewVideoUrl', url);
                    form.data('autoCoverVideoUrl', '');
                }
                $video.attr('src', playUrl);
                videoEl.load();
                $wrap.show();
            },
            /**
             * 从已加载的 video DOM 截取当前帧
             */
            captureFrameFromVideoEl: function (video) {
                return new Promise(function (resolve, reject) {
                    try {
                        var w = video.videoWidth || 0;
                        var h = video.videoHeight || 0;
                        if (!w || !h) {
                            return reject(new Error('empty video frame'));
                        }
                        var canvas = document.createElement('canvas');
                        canvas.width = w;
                        canvas.height = h;
                        canvas.getContext('2d').drawImage(video, 0, 0, w, h);
                        if (typeof canvas.toBlob === 'function') {
                            canvas.toBlob(function (blob) {
                                if (!blob) {
                                    reject(new Error('toBlob failed'));
                                } else {
                                    resolve(blob);
                                }
                            }, 'image/jpeg', 0.85);
                        } else {
                            var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                            var parts = dataUrl.split(',');
                            var mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
                            var binary = atob(parts[1] || '');
                            var len = binary.length;
                            var bytes = new Uint8Array(len);
                            for (var i = 0; i < len; i++) {
                                bytes[i] = binary.charCodeAt(i);
                            }
                            resolve(new Blob([bytes], {type: mime}));
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            },
            /**
             * 将封面 URL 写入字段并刷新预览缩略图
             */
            setCoverValue: function (form, url) {
                form = $(form);
                form.data('coverAutoWriting', true);
                $('#c-cover', form).val(url).trigger('change').trigger('validate');
                setTimeout(function () {
                    form.data('coverAutoWriting', false);
                }, 0);
            },
            /**
             * 预览视频加载后：截取第一帧上传并填入封面
             */
            autoFillCoverFromPreview: function (form) {
                form = $(form);
                if (Controller.api.getTypeId(form) !== 2) {
                    return;
                }
                var videoUrl = $.trim($('#c-content-video', form).val() || '');
                if (!videoUrl || !Controller.api.isPlayableVideoUrl(videoUrl)) {
                    return;
                }
                // 用户手动封面且视频未换：不覆盖
                if (form.data('coverManual') && form.data('autoCoverVideoUrl') === videoUrl) {
                    return;
                }
                // 该视频已自动生成过封面
                if (form.data('autoCoverVideoUrl') === videoUrl && $.trim($('#c-cover', form).val() || '')) {
                    return;
                }
                // 编辑回填已有封面：保留，除非用户更换了视频
                var cover = $.trim($('#c-cover', form).val() || '');
                if (cover && form.data('coverManual') && !form.data('previewVideoUrlChanged')) {
                    return;
                }

                var video = $('#c-content-video-preview', form)[0];
                if (!video || !video.videoWidth) {
                    return;
                }
                if (form.data('coverCapturing')) {
                    return;
                }
                form.data('coverCapturing', true);

                var ensureSeeked = function () {
                    return new Promise(function (resolve, reject) {
                        var t = 0.1;
                        if (video.duration && isFinite(video.duration)) {
                            t = Math.min(0.1, Math.max(0, video.duration * 0.01));
                        }
                        var onSeeked = function () {
                            video.removeEventListener('seeked', onSeeked);
                            resolve();
                        };
                        try {
                            if (Math.abs((video.currentTime || 0) - t) < 0.001 && video.readyState >= 2) {
                                resolve();
                                return;
                            }
                            video.addEventListener('seeked', onSeeked);
                            video.currentTime = t;
                        } catch (e) {
                            video.removeEventListener('seeked', onSeeked);
                            reject(e);
                        }
                    });
                };

                ensureSeeked().then(function () {
                    return Controller.api.captureFrameFromVideoEl(video);
                }).then(function (blob) {
                    return Controller.api.uploadCoverBlob(blob);
                }).then(function (url) {
                    Controller.api.setCoverValue(form, url);
                    form.data('autoCoverVideoUrl', videoUrl);
                    form.data('coverManual', false);
                    form.data('previewVideoUrlChanged', false);
                }).catch(function () {
                    // 跨域等失败：提交时再兜底
                }).then(function () {
                    form.data('coverCapturing', false);
                });
            },
            /**
             * 独立创建 video 截取第一帧（提交兜底）
             */
            captureVideoCover: function (videoUrl) {
                return new Promise(function (resolve, reject) {
                    var fullUrl = Fast.api.cdnurl(videoUrl, true);
                    var video = document.createElement('video');
                    var settled = false;
                    var sameOrigin = fullUrl.indexOf(location.origin) === 0 || !/^https?:\/\//i.test(fullUrl);
                    if (!sameOrigin) {
                        video.crossOrigin = 'anonymous';
                    }
                    video.muted = true;
                    video.playsInline = true;
                    video.preload = 'auto';

                    var finish = function (err, blob) {
                        if (settled) {
                            return;
                        }
                        settled = true;
                        clearTimeout(timer);
                        try {
                            video.pause();
                            video.removeAttribute('src');
                            video.load();
                        } catch (e) {
                        }
                        if (err) {
                            reject(err);
                        } else {
                            resolve(blob);
                        }
                    };

                    var timer = setTimeout(function () {
                        finish(new Error('capture timeout'));
                    }, 15000);

                    video.addEventListener('loadeddata', function () {
                        try {
                            var t = 0.1;
                            if (video.duration && isFinite(video.duration)) {
                                t = Math.min(0.1, Math.max(0, video.duration * 0.01));
                            }
                            if (video.currentTime === t) {
                                video.dispatchEvent(new Event('seeked'));
                            } else {
                                video.currentTime = t;
                            }
                        } catch (e) {
                            finish(e);
                        }
                    });

                    video.addEventListener('seeked', function () {
                        Controller.api.captureFrameFromVideoEl(video).then(function (blob) {
                            finish(null, blob);
                        }).catch(function (e) {
                            finish(e);
                        });
                    });

                    video.addEventListener('error', function () {
                        finish(new Error('video load error'));
                    });

                    video.src = fullUrl;
                });
            },
            uploadCoverBlob: function (blob) {
                return new Promise(function (resolve, reject) {
                    var fileName = 'video_cover_' + Date.now() + '.jpg';
                    var file = (typeof File !== 'undefined')
                        ? new File([blob], fileName, {type: 'image/jpeg'})
                        : blob;
                    if (!(file instanceof File) && blob instanceof Blob) {
                        try {
                            file.lastModifiedDate = new Date();
                            file.name = fileName;
                        } catch (e) {
                        }
                    }
                    Controller.api.uploadOssFile(file, 'image', function (data) {
                        var url = data.url || data.fullurl || '';
                        if (url) {
                            resolve(url);
                        } else {
                            reject(new Error('upload empty url'));
                        }
                    }, function () {
                        reject(new Error('upload failed'));
                    });
                });
            },
            /**
             * 提交前若仍无封面再截帧上传（兜底）
             */
            ensureVideoCoverBeforeSubmit: function (form, success, error) {
                form = $(form);
                if (Controller.api.getTypeId(form) !== 2) {
                    return true;
                }
                var cover = $.trim($('#c-cover', form).val() || '');
                if (cover) {
                    return true;
                }
                var videoUrl = Controller.api.getVideoUrl(form);
                if (!videoUrl) {
                    return true;
                }
                var preview = $('#c-content-video-preview', form)[0];
                var capturePromise;
                if (preview && preview.videoWidth) {
                    capturePromise = Controller.api.captureFrameFromVideoEl(preview);
                } else {
                    capturePromise = Controller.api.captureVideoCover(videoUrl);
                }
                var loading = Layer.msg(__('Uploading'), {icon: 16, time: 0, shade: 0.1});
                capturePromise.then(function (blob) {
                    return Controller.api.uploadCoverBlob(blob);
                }).then(function (url) {
                    Layer.close(loading);
                    Controller.api.setCoverValue(form, url);
                    Form.api.submit(form, success, error);
                }).catch(function () {
                    Layer.close(loading);
                    Form.api.submit(form, success, error);
                });
                return false;
            },
            switchContentByType: function (form) {
                var typeId = Controller.api.getTypeId(form);
                var $editorGroup = $('#content-editor-group', form);
                var $videoGroup = $('#content-video-group', form);
                var $textarea = $('#c-content', form);
                var $videoInput = $('#c-content-video', form);

                if (typeId === 2) {
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
                    Controller.api.updateVideoPreview(form);
                } else {
                    if ($videoInput.attr('name') === 'row[content]') {
                        $textarea.val($videoInput.val());
                    }
                    $videoInput.prop('disabled', true).removeAttr('name');
                    $textarea.prop('disabled', false).attr('name', 'row[content]');
                    Controller.api.clearVideoPreview(form);
                    $videoGroup.hide();
                    $editorGroup.show();
                    Controller.api.initEditor(form);
                }
            },
            bindevent: function () {
                var form = $("form[role=form]");
                var previewTimer = null;
                form.data('validator-options', $.extend({}, form.data('validator-options') || {}, {
                    ignore: ':hidden:not(.editor)'
                }));

                // 编辑页已有封面：视为手动，避免加载视频时覆盖
                if ($.trim($('#c-cover', form).val() || '')) {
                    form.data('coverManual', true);
                    form.data('autoCoverVideoUrl', $.trim($('#c-content-video', form).val() || ''));
                }

                Form.api.bindevent(form, null, null, function (success, error) {
                    Controller.api.syncEditor(form);
                    return Controller.api.ensureVideoCoverBeforeSubmit(this, success, error);
                });
                form.off('change.newsType', 'input[name="row[type_id]"]').on('change.newsType', 'input[name="row[type_id]"]', function () {
                    Controller.api.switchContentByType(form);
                });
                form.off('input.newsVideoPreview change.newsVideoPreview blur.newsVideoPreview', '#c-content-video')
                    .on('input.newsVideoPreview change.newsVideoPreview blur.newsVideoPreview', '#c-content-video', function () {
                        var url = $.trim($(this).val() || '');
                        if (form.data('previewVideoUrl') !== url) {
                            form.data('previewVideoUrlChanged', true);
                            form.data('coverManual', false);
                        }
                        clearTimeout(previewTimer);
                        previewTimer = setTimeout(function () {
                            Controller.api.updateVideoPreview(form);
                        }, 300);
                    });
                // 预览 video 加载后自动截封面并写入封面字段
                form.off('loadeddata.newsCover', '#c-content-video-preview')
                    .on('loadeddata.newsCover', '#c-content-video-preview', function () {
                        Controller.api.autoFillCoverFromPreview(form);
                    });
                // 用户手动改封面
                form.off('change.newsCoverManual', '#c-cover').on('change.newsCoverManual', '#c-cover', function () {
                    if (form.data('coverAutoWriting')) {
                        return;
                    }
                    form.data('coverManual', true);
                    form.data('autoCoverVideoUrl', $.trim($('#c-content-video', form).val() || ''));
                });
                Controller.api.bindVideoUpload(form);
                Controller.api.switchContentByType(form);
                $(document).off('click.newsSimditor', '.layui-layer-footer .btn-primary').on('click.newsSimditor', '.layui-layer-footer .btn-primary', function () {
                    Controller.api.syncEditor(form);
                });
            }
        }
    };
    return Controller;
});
