/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('WebEscada.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    requires: [
    	'WebEscada.view.login.Login',
        'WebEscada.view.svg.Svg',
        'WebEscada.view.runtime.Runtime',
        'WebEscada.view.svg.Window'
    ],
    lastView: null,
    isLogin:false,
    listen: {
    	controller: {
    		'#': {
    			unmatchedroute: 'onRouteChange'
    		}
    	}
    },
    routes: {
    	':node': 'onRouteChange'
    },
    
    onRouteChange: function(id){
        this.setCurrentView(id);
    },

    onItemSelected: function (sender, record) {
        Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', this);
    },

    onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    },
    
    RouteChange: function (route) {
        if (route) {
            this.redirectTo(route);
        }
    },
    
    setCurrentView: function(hashTag) {
    	console.log('setCurrentView: '+hashTag);
        hashTag = (hashTag || '').toLowerCase();
        if (!this.isLogin && hashTag !== 'login') return;
        var me = this,
        refs = me.getReferences(),
        mainCard = refs.mainContainerWrap,
        mainLayout = mainCard.getLayout(),
        view = (hashTag=='login' || hashTag=='svg' || hashTag=='runtime' || hashTag=='history' ||
        	hashTag=='report' || hashTag=='system' || hashTag=='alarm' || hashTag=='device')
        	? hashTag : 'page404',
        lastView = me.lastView,
        existingItem = mainCard.child('component[routeId=' + hashTag + ']'),
        newView;
        // Kill any previously routed window
        if (lastView && lastView.isWindow) {
            lastView.destroy();
        }
        lastView = mainLayout.getActiveItem();
        if (!existingItem) {
            newView = Ext.create({
                xtype: view,
                id: hashTag,
                routeId: hashTag,
                hideMode: 'offsets'
            }); 	
        }
        if (!newView || !newView.isWindow) {
            if (existingItem) {
                if (existingItem !== lastView) {
                    mainLayout.setActiveItem(existingItem);
                }
                newView = existingItem;
            }
            else {
                Ext.suspendLayouts();
                mainLayout.setActiveItem(mainCard.add(newView));
                Ext.resumeLayouts(true);
            }
        }
        if (newView.isFocusable(true)) {
            newView.focus();
        }
    	
        this.lastView = newView;
        
    },
    onMainViewRender: function () {
        var me = this;
        Ext.Msg.wait(I18N.GetUserInfo);
        Ext.Ajax.request({
            url: URI.get('account', 'userinfo'),
            success: function (response, opts) {
                var me = this,
                    viewModel = me.getViewModel(),
                    obj = Ext.decode(response.responseText, true),
                    hash, node, parentNode, roles;
                Ext.Msg.hide();
                //console.log(obj);
                if (Ext.isEmpty(obj) || !obj.success) {
                	console.log("login");
                    me.setCurrentView("login");
                    return;
                }
                viewModel.set('UserName', obj.data.UserInfo.UserName);
                var arrSvgFile = Ext.clone(obj.data.Menu);//复制素组，防止引用
                EscadaConfig.setUserInfo(obj.data.UserInfo);
                EscadaConfig.setEvgFileNavigation(arrSvgFile);
                EscadaConfig.setRuntimeDataNavigation(Ext.clone(obj.data.RtMenu));
                //根据角色加载相应模块
                me.LoadModule(obj.data.Menu);
                
                Ext.Msg.wait(I18N.StateRestoreWait);
                //STATE.restore();
                Ext.Msg.hide();
                me.isLogin = true;
                hash = window.location.hash.substr(1);
                me.setCurrentView( (Ext.isEmpty(hash) || hash === 'login') ? "svg" : hash);
            },
            failure: FAILED.ajax,
            scope: me
        });
    },
    //根据用户加载相应的模块
    LoadModule: function(temp) {
        var arr = [];
        var Menu = {
                ui: 'green',scale: 'medium',xtype: 'button',cls: 'esacada-headerbar-menu',
                text : I18N.AppTitle,icon: URI.getResource('logo'),
                menu : Ext.widget('menu', {items: []})
        };
        var Diagram = {
                ui: 'soft-purple',scale: 'medium',text: '主接线图',
            	icon: URI.getResource('classic') + 'wiringdiagram/diagram-icon-16x16.png',
                handler: 'onWiringDiagram',tooltip: '主接线图'
        };
        var Runtime = {
                ui: 'soft-purple',scale: 'medium',text: '实时数据',
            	icon: URI.getResource('classic') + 'rtdblist/rtdblist-icon-16x16.png',
                handler: 'onRunTimeData',tooltip: '实时数据'
        };
        var History = {
                ui: 'soft-purple',scale: 'medium',text: '历史数据',
            	icon: URI.getResource('classic') + 'hisdatalist/hisdatalist-icon-16x16.png',
                handler: 'onHistoryData',tooltip: '历史数据'
        };
        var Report = {
                ui: 'soft-purple',scale: 'medium',text: '报表管理',
            	icon: URI.getResource('classic') + 'reportmanager/reportmanager-icon-16x16.png',
                handler: 'onReportMenager',tooltip: '报表管理'
        };
        var System = {
                ui: 'soft-purple',scale: 'medium',text: '系统监控',
            	icon: URI.getResource('classic') + 'sysctrl/sysctrl-icon-16x16.png',
                handler: 'onSystemMonitor',tooltip: '系统监控'
        };
        var Alarm = {
                ui: 'soft-purple',scale: 'medium',text: '实时报警',
            	icon: URI.getResource('classic') + 'rtalarm/rtalarm-icon-16x16.png',
                handler: 'onAlarm',tooltip: '实时报警'
        };
        var Device = {
                ui: 'soft-purple',scale: 'medium',text: '设备管理',
                icon:  URI.getResource('classic') + 'devicemanager/devicemanager-icon-16x16',
                handler: 'onDeviceManager',tooltip: '设备管理'
        };
        var Logout = {ui: 'header',iconCls: 'x-fa fa-power-off',handler: 'onLogout',tooltip: I18N.Logout,cls: 'top-logout'};
        var UserName = {xtype: 'tbtext',bind: { text: '{UserName}' },cls: 'top-user-name'};
        
    	var toolbar = Ext.getCmp('top_toolbar');
        var role = EscadaConfig.getUserInfo().Roles;
        if(role === "系统管理员"){
        	arr = [Diagram,Runtime,History,Report,Alarm,Device,System];
        }else if(role === "操作员"){//值班人员
        	arr = [Diagram,Runtime,History,Report,Alarm],System;
        }else{//一般访客
        	arr = [Diagram,Runtime,History,Report,Alarm,System];
        }
    	Menu.menu.add(arr);
    	toolbar.add(Menu);
    	arr = arr.concat(['->',Logout,UserName]);
    	//console.log(arr);
    	toolbar.add(arr);

    },

    //相应模块点击事件
    onWiringDiagram: function(btn){
    	this.RouteChange("svg");
    },
    onRunTimeData: function(btn,scope){
    	this.RouteChange("runtime");
    },
    onHistoryData: function(btn,scope){
    	this.RouteChange("history");
    	alert("该功正在开发中……");
    },
    onReportMenager: function(btn,scope){
    	this.RouteChange("report");
    	alert("该功正在开发中……");
    },
    onSystemMonitor: function(btn,scope){
    	this.RouteChange("system");
    	alert("该功正在开发中……");
    },
    onAlarm: function(btn,scope){
    	this.RouteChange("alarm");
    	alert("该功正在开发中……");
    },
    onDeviceManager: function(btn,scope){
    	this.RouteChange("device");
    	alert("该功正在开发中……");
    },
    
	//F11全屏时触发消息
    onFullScreen: function(el){
       	var head = Ext.getCmp('top_toolbar');
       	var navigation = Ext.getCmp('left_navigation');
       	var bottom = Ext.getCmp('bottom_toobar');
       	head.hide();
       	navigation.hide();
       	bottom.hide();
    },
	onNormal: function(el){
    	var head = Ext.getCmp('top_toolbar');
    	var navigation = Ext.getCmp('left_navigation');
    	var bottom = Ext.getCmp('bottom_toobar');
    	head.show();
    	navigation.show();
    	bottom.show();
	}
    
});
