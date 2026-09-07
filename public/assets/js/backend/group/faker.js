define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            var params = new URLSearchParams(location.search);
            var groupId = params.get('group_id') || (Config && Config.group_id ? Config.group_id : '');

            Table.api.init({
                extend: {
                    index_url: 'group/faker/index' + (groupId ? '?group_id=' + groupId : ''),
                    add_url: 'group/faker/add' + (groupId ? '?group_id=' + groupId : ''),
                    del_url: 'group/faker/del' + (groupId ? '?group_id=' + groupId : ''),
                    table: 'group_faker',
                }
            });

            var table = $("#table");

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'desc',
                fixedColumns: true,
                fixedRightNumber: 1,
                columns: [
                    [
                        {checkbox: true},
                        {field: 'faker_id', title: '假人ID', sortable: true},
                        {field: 'username', title: '用户名', operate: 'LIKE'},
                        {field: 'nickname', title: '昵称', operate: 'LIKE'},
                        {
                            field: 'avatar',
                            title: '头像',
                            events: Table.api.events.image,
                            formatter: Table.api.formatter.image,
                            operate: false
                        },
                        {
                            field: 'faker_created_at',
                            title: '创建时间',
                            formatter: Table.api.formatter.datetime,
                            operate: false
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
            var groupId = (Config && Config.group_id) ? Config.group_id : '';
            var $input = $('#c-faker_id');
            var $card = $('#faker-card');
            var $submit = $('#btn-submit-add');
            var timer = null;
            var lastRequestId = 0;
            var canSubmit = false;

            var renderEmpty = function (msg) {
                canSubmit = false;
                $card.html('<div class="faker-card-empty text-muted">' + (msg || '请输入假人ID进行搜索') + '</div>');
            };

            var escapeHtml = function (str) {
                return String(str == null ? '' : str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            var renderCard = function (data) {
                var avatar = data.avatar || '/assets/img/avatar.png';
                var statusClass = 'ok';
                var statusText = '可以添加为当前群虚拟成员';
                canSubmit = true;

                if (data.exists_in_group) {
                    statusClass = 'warn';
                    statusText = '该假人已是当前群虚拟成员，无法重复添加';
                    canSubmit = false;
                }

                var html = ''
                    + '<div class="faker-card-body">'
                    + '  <img class="faker-card-avatar" src="' + escapeHtml(avatar) + '" alt="avatar">'
                    + '  <div class="faker-card-meta">'
                    + '    <div class="name">' + escapeHtml(data.nickname || data.username || ('假人#' + data.id)) + '</div>'
                    + '    <div class="sub">假人ID：' + escapeHtml(data.id) + '</div>'
                    + '    <div class="sub">用户名：' + escapeHtml(data.username || '-') + '</div>'
                    + (data.user_id ? ('    <div class="sub">用户ID：' + escapeHtml(data.user_id) + '</div>') : '')
                    + '  </div>'
                    + '</div>'
                    + '<div class="faker-card-status ' + statusClass + '">' + statusText + '</div>';

                $card.html(html);
            };

            var searchFaker = function () {
                var fakerId = $.trim($input.val());
                if (!fakerId || !/^\d+$/.test(fakerId) || parseInt(fakerId, 10) <= 0) {
                    renderEmpty('请输入有效的假人ID');
                    return;
                }

                var requestId = ++lastRequestId;
                $card.html('<div class="faker-card-empty text-muted">搜索中...</div>');
                canSubmit = false;

                $.ajax({
                    url: 'group/faker/preview',
                    type: 'GET',
                    dataType: 'json',
                    data: {
                        faker_id: fakerId,
                        group_id: groupId
                    },
                    success: function (ret) {
                        if (requestId !== lastRequestId) {
                            return;
                        }
                        if (ret && ret.code === 1 && ret.data) {
                            renderCard(ret.data);
                        } else {
                            renderEmpty((ret && ret.msg) ? ret.msg : '未找到该假人');
                        }
                    },
                    error: function () {
                        if (requestId !== lastRequestId) {
                            return;
                        }
                        renderEmpty('搜索失败，请稍后重试');
                    }
                });
            };

            $input.on('input', function () {
                clearTimeout(timer);
                canSubmit = false;
                timer = setTimeout(searchFaker, 350);
            });

            $input.on('change blur', function () {
                clearTimeout(timer);
                searchFaker();
            });

            $('form[role=form]').on('reset', function () {
                setTimeout(function () {
                    renderEmpty();
                }, 0);
            });

            Form.api.bindevent($('form[role=form]'), null, null, function () {
                if (!canSubmit) {
                    Toastr.error('请先输入有效且未加入该群的假人ID');
                    return false;
                }
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
