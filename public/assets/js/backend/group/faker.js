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
            var $input = $('#c-faker_ids');
            var $cards = $('#faker-cards');
            var timer = null;
            var lastRequestId = 0;
            var canSubmit = false;

            var escapeHtml = function (str) {
                return String(str == null ? '' : str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            var renderEmpty = function (msg) {
                canSubmit = false;
                $cards.html('<div class="faker-cards-empty text-muted">' + (msg || '请输入假人ID进行搜索') + '</div>');
            };

            var parseFakerIds = function (raw) {
                var seen = {};
                var items = [];
                String(raw || '').split(',').forEach(function (part) {
                    var token = $.trim(part);
                    if (token === '') {
                        return;
                    }
                    if (!/^\d+$/.test(token) || parseInt(token, 10) <= 0) {
                        items.push({type: 'invalid', token: token});
                        return;
                    }
                    var id = parseInt(token, 10);
                    if (seen[id]) {
                        return;
                    }
                    seen[id] = true;
                    items.push({type: 'id', id: id});
                });
                return items;
            };

            var buildCardHtml = function (options) {
                var cls = 'faker-card-item' + (options.invalid ? ' is-invalid' : '');
                var statusClass = options.statusClass || 'info';
                var bodyHtml = options.bodyHtml || '';
                return ''
                    + '<div class="' + cls + '" data-faker-id="' + escapeHtml(options.fakerId || '') + '">'
                    + bodyHtml
                    + '<div class="faker-card-status ' + statusClass + '">' + options.statusText + '</div>'
                    + '</div>';
            };

            var renderInvalidCard = function (token) {
                return buildCardHtml({
                    invalid: true,
                    fakerId: '',
                    statusClass: 'err',
                    statusText: 'ID 格式无效：' + escapeHtml(token),
                    bodyHtml: ''
                        + '<div class="faker-card-body">'
                        + '  <div class="faker-card-meta">'
                        + '    <div class="name">无效 ID</div>'
                        + '    <div class="sub">' + escapeHtml(token) + '</div>'
                        + '  </div>'
                        + '</div>'
                });
            };

            var renderFoundCard = function (data) {
                var avatar = data.avatar || '/assets/img/avatar.png';
                var statusClass = 'ok';
                var statusText = '可以添加为当前群虚拟成员';

                if (data.exists_in_group) {
                    statusClass = 'warn';
                    statusText = '该假人已是当前群虚拟成员，无法重复添加';
                }

                var bodyHtml = ''
                    + '<div class="faker-card-body">'
                    + '  <img class="faker-card-avatar" src="' + escapeHtml(avatar) + '" alt="avatar">'
                    + '  <div class="faker-card-meta">'
                    + '    <div class="name">' + escapeHtml(data.nickname || data.username || ('假人#' + data.id)) + '</div>'
                    + '    <div class="sub">假人ID：' + escapeHtml(data.id) + '</div>'
                    + '    <div class="sub">用户名：' + escapeHtml(data.username || '-') + '</div>'
                    + (data.user_id ? ('    <div class="sub">用户ID：' + escapeHtml(data.user_id) + '</div>') : '')
                    + '  </div>'
                    + '</div>';

                return buildCardHtml({
                    fakerId: data.id,
                    statusClass: statusClass,
                    statusText: statusText,
                    bodyHtml: bodyHtml
                });
            };

            var renderNotFoundCard = function (id) {
                return buildCardHtml({
                    invalid: true,
                    fakerId: id,
                    statusClass: 'err',
                    statusText: '未找到该假人',
                    bodyHtml: ''
                        + '<div class="faker-card-body">'
                        + '  <div class="faker-card-meta">'
                        + '    <div class="name">假人#' + escapeHtml(id) + '</div>'
                        + '    <div class="sub">数据库中不存在</div>'
                        + '  </div>'
                        + '</div>'
                });
            };

            var updateSubmitState = function (state) {
                canSubmit = !!(state && state.canSubmit);
            };

            var searchFakers = function () {
                var items = parseFakerIds($.trim($input.val()));
                if (!items.length) {
                    renderEmpty('请输入有效的假人ID');
                    return;
                }

                var requestId = ++lastRequestId;
                canSubmit = false;
                $cards.html('<div class="faker-cards-empty text-muted">搜索中...</div>');

                var htmlParts = [];
                var fetchItems = [];

                items.forEach(function (item) {
                    if (item.type === 'invalid') {
                        htmlParts.push({sort: htmlParts.length, html: renderInvalidCard(item.token)});
                    } else {
                        htmlParts.push({sort: htmlParts.length, pending: true, id: item.id});
                        fetchItems.push(item.id);
                    }
                });

                if (!fetchItems.length) {
                    $cards.html(htmlParts.map(function (p) { return p.html; }).join(''));
                    updateSubmitState({canSubmit: false});
                    return;
                }

                var completed = 0;
                var hasInvalid = htmlParts.some(function (p) { return p.html && !p.pending; });
                var addableCount = 0;

                fetchItems.forEach(function (fakerId) {
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
                            htmlParts.forEach(function (part) {
                                if (part.pending && part.id === fakerId) {
                                    if (ret && ret.code === 1 && ret.data) {
                                        part.html = renderFoundCard(ret.data);
                                        if (!ret.data.exists_in_group) {
                                            addableCount++;
                                        }
                                    } else {
                                        part.html = renderNotFoundCard(fakerId);
                                        hasInvalid = true;
                                    }
                                    part.pending = false;
                                }
                            });
                        },
                        error: function () {
                            if (requestId !== lastRequestId) {
                                return;
                            }
                            htmlParts.forEach(function (part) {
                                if (part.pending && part.id === fakerId) {
                                    part.html = renderNotFoundCard(fakerId);
                                    part.pending = false;
                                    hasInvalid = true;
                                }
                            });
                        },
                        complete: function () {
                            if (requestId !== lastRequestId) {
                                return;
                            }
                            completed++;
                            if (completed < fetchItems.length) {
                                return;
                            }
                            htmlParts.sort(function (a, b) { return a.sort - b.sort; });
                            $cards.html(htmlParts.map(function (p) { return p.html; }).join(''));
                            updateSubmitState({
                                canSubmit: !hasInvalid && addableCount > 0
                            });
                        }
                    });
                });
            };

            $input.on('input', function () {
                clearTimeout(timer);
                canSubmit = false;
                timer = setTimeout(searchFakers, 350);
            });

            $input.on('change blur', function () {
                clearTimeout(timer);
                searchFakers();
            });

            $('form[role=form]').on('reset', function () {
                setTimeout(function () {
                    renderEmpty();
                }, 0);
            });

            Form.api.bindevent($('form[role=form]'), null, null, function () {
                if (!canSubmit) {
                    Toastr.error('请填写有效假人ID，且至少有一个可添加（已在群中的假人无法重复添加）');
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
