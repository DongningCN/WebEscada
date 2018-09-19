Ext.define('WebEscada.util.Url', {
    alternateClassName: 'URI',
    singleton: true,

    config: {
    },

    constructor: function (config) {
        this.initConfig(config);
        this.callParent(arguments);
    },

    defaultActions: {
        create: 'create',
        read: 'list',
        update: 'update',
        destroy: 'delete',
        details: 'details'
    },

    actions: {},

    urlFormat: '{0}/{1}/{2}',

    get: function (controller, action) {
        var me = this;
        if (!Ext.isString(controller) || Ext.isEmpty(controller)) Ext.raise('非法的控制器名称');
        if (!Ext.isString(action) && !Ext.isNumber(action)) Ext.raise('非法的操作名称');
        return Ext.String.format(me.urlFormat, ROOTPATH, controller, me.defaultActions[action] || me.actions[action] || action);
    },

    crud: {
        c: 'create',
        r: 'read',
        u: 'update',
        d: 'destroy'
    },

    getApi: function (controller, action) {
        var me = this, act, ln, i, result = {};
        action = Ext.isString(action) ? action.toLowerCase() : '';
        ln = action.length;
        for (i = 0; i < ln; i++) {
            act = me.crud[action[i]];
            if (act) {
                result[act] = me.get(controller, act);
            }
        }
        return result;
    },
    //相对路径
    getCss: function (platform) {
    	return '/WebEscada/' + (platform ? (platform+'/') : '') + 'resources/css/';
    },
    getScript: function (platform) {
    	return '/WebEscada/' + (platform ? (platform+'/') : '') + 'resources/script/';
    },
    getEvg: function (platform) {
    	return '/WebEscada/' + (platform ? (platform+'/') : '') + 'resources/wiringdiagram/';
    },
    getImg: function (platform) {
    	return '/WebEscada/' + (platform ? (platform+'/') : '') + 'resources/images/';
    },
    getSvgToolbarImg: function (platform) {
    	return '/WebEscada/' + (platform ? (platform+'/') : '') + 'resources/images/ctrls.png';
    },

    resources: {
        logo: 'resources/images/company-logo.png',
        '': 'resources/images/'
    },
    ROOTPATH : 'http://webescada.com/WebEscada/',
  //绝对路径
    getResource: function (res) {
        var me = this;
        if(res === 'classic' || res === 'modern'){
        	return me.ROOTPATH + res + '/' + 'resources/images/';
        }else{
        	return me.ROOTPATH + ((res&&me.resources[res]) ? me.resources[res] : 'resources/images/');
        }
    }

});
