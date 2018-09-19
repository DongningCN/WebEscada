/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('WebEscada.view.main.Main', {
    extend: 'Ext.container.Viewport',
    xtype: 'app-main',

    requires: [
        'WebEscada.view.main.MainController',
        'WebEscada.view.main.MainModel',
        'WebEscada.view.navigation.Navigation'
    ],
    keyMap: {
    	F11: 'onFullScreen',
    	SPACE: 'onNormal'
    },
    controller: 'main',
    viewModel: 'main',
    listeners: {
        render: 'onMainViewRender'
    },
    layout: 'border',
    items: [
        {
        	//导航栏菜单，主要的导向作用
        	region: 'north',
            xtype: 'toolbar',
            id: 'top_toolbar',
            cls: 'esacada-headerbar',
            height: 64
    }, {
    	region: 'west',
        id: 'left_navigation',
        xtype: 'left-navigation',
        ui: 'navigation',
        cls: 'esacada-navigation'
    }, {
        region: 'south',
        xtype : 'toolbar',
        id: 'bottom_toobar',
        cls: 'esacada-bottombar shadow',
		ui : 'head',
		items : [
			{
				xtype : 'label',
				itemId : 'bbar-label1',
				iconCls: 'x-fa fa-key',
				text : '无报警'
			}, '->', {
				xtype : 'label',
				itemId : 'bbar-label2',
				iconCls: 'x-fa fa-key',
				text : '当前用户描述'
			}, {
				cls : 'icon-logout',
				itemId : 'bbar-logout',
				text : '注销',
				glyph : 'xf08b@FontAwesome'
			}, {
				cls : 'icon-resetpass',
				iconCls: 'x-fa fa-key',
				itemId : 'bbar--resetpass',
				text : '修改密码',
				href: '#passwordreset',
				hrefTarget: '_self'
			}, {
				text : '在线人数',
				itemId : 'bbar-online'
			}
		]
    }, {
//        region: 'east',
//        title: 'East Panel',
//        collapsible: true,
//        split: true,
//        width: 150
    }, {
        region: 'center',
        xtype: 'panel', // TabPanel itself has no title
        id: 'content_panel',
        cls: 'esacada-content'
//        activeTab: 0      // First tab active by default
    }]
});
