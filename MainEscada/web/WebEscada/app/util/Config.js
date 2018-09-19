Ext.define('WebEscada.util.Config', {
    alternateClassName: 'EscadaConfig',
    singleton: true,

    config: {
        userInfo: null,
        evgFileNavigation:[],
        runtimeDataNavigation:[{
        		"text":"厂站001","expanded":false,"allowDrag":false,
        		"children":[
        			{
	        			"text":"遥信",
	        			"id":"yx",
	        			"leaf": true
        			},{
            			"text":"遥测",
            			"id":"yc",
            			"leaf": true
            		},{
            			"text":"脉冲",
            			"id":"mc",
            			"leaf": true
            		}
        		]
        	},{
        		"text":"通道001","expanded":false,"allowDrag":false,
        		"children":[
        			{
        			"text":"Rtu1",
        			"id":"Rtu1",
            		"children":[
            			{
	            			"text":"遥信",
	            			"id":"Rtu1yx",
	            			"leaf": true
            			},{
                			"text":"遥测",
                			"id":"Rtu1yc",
                			"leaf": true
                		},{
                			"text":"脉冲",
                			"id":"Rtu1mc",
                			"leaf": true
                		}
                	]
        			},{
            			"text":"Rtu2",
            			"id":"Rtu2",
                		"children":[
                			{
                			"text":"遥信",
                			"id":"Rtu2yx",
                			"leaf": true
                			},{
                    			"text":"遥测",
                    			"id":"Rtu2yc",
                    			"leaf": true
                    		},{
                    			"text":"脉冲",
                    			"id":"Rtu2mc",
                    			"leaf": true
                    		}
                		]
            		},{
            			"text":"Rtu3",
            			"id":"Rtu3",
                		"children":[
                			{
                			"text":"遥信",
                			"id":"Rtu3yx",
                			"leaf": true
                			},{
                    			"text":"遥测",
                    			"id":"Rtu3yc",
                    			"leaf": true
                    		},{
                    			"text":"脉冲",
                    			"id":"Rtu3mc",
                    			"leaf": true
                    		}
                		]
            		}
        		]
        	}
        ]
    },

    constructor: function (config) {
        this.initConfig(config);
        this.callParent(arguments);
    },
    
    getDefaultNavigation: function (module) {
    	if(module == "主接线图") {
    		var arr = this.getEvgFileNavigation();
	    	for(var i=0;i<arr.length;i++) {
	    		if(arr[i].leaf && arr[i].id) {
	    			return arr[i].id;
	    		}
	    	}    		
    	}

    },

    dialogs: {},

    getDialog: function (xtype) {
        var me = this,
            dialog = me.dialogs[xtype];
        if (!dialog) {
            dialog = Ext.ClassManager.getByAlias('widget.' + xtype);
            if (dialog === undefined) Ext.raise('没有找到xtype为' + xtype + '的类');
            if (typeof (dialog) === 'function') {
                dialog = Ext.create(dialog);
            };
            me.dialogs[xtype] = dialog;
        }
        return dialog;
    }


});
