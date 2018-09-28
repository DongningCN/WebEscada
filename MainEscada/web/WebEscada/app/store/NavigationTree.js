Ext.define('WebEscada.store.NavigationTree', {
    extend: 'Ext.data.TreeStore',

    storeId: 'NavigationTree',

    fields: [{
        name: 'text'
    }],

    root: {
        expanded: true,
        children: [
            {
                text: '登录视图',
                viewType: 'login',
                leaf: true,
                visible: false
            },
            {
                text: '修改密码视图',
                viewType: 'passwordreset',
                leaf: true,
                visible: false
            }
        ]
    }
});
