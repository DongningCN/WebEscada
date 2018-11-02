Ext.define('WebEscada.util.Config', {
    alternateClassName: 'EscadaConfig',
    singleton: true,

    config: {
        userInfo: null,
        evgFileNavigation:[],
        runtimeDataNavigation:[]
    },

    constructor: function (config) {
        this.initConfig(config);
        this.callParent(arguments);
    },
    
    getDefaultNavigation: function (id) {
    	if(id == "svg_diagram") {
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
    },
    
    getBaseColumns: function () {
    	var columns = [
            { xtype: 'rownumberer',width: 50,sortable: false},
            { text: 'iid', dataIndex: 'iid', hidden: true,sortable: false},
            { text: '名称',dataIndex: 'name',width: 150,sortable: false},
            { text: '描述',dataIndex: 'desc',width: 300,sortable: false},
            { text: '点类型',dataIndex: 'type',width: 150,sortable: false},
            { text: '主地址',dataIndex: 'address',hidden: true},
            { text: '备地址',dataIndex: 'addrres',hidden: true}
    	];
    	return columns;
    },
    getNormalColumns: function () {
    	var columns = [
            { text: '有效性', width: 100,dataIndex: 'biIV', sortable: false},
            { text: '刷新状态', width: 100, dataIndex: 'biIsRefresh', sortable: false},
            { text: '人工置数',width: 100, dataIndex: 'biIsManual',sortable: false}
    	];
    	return columns;
    },
    getRtYxColumns: function () {
    	var StaticAttr = [
    		{ text: '1→0次数',dataIndex: 'biOpenCnt', width: 100, sortable: false,hidden: true},
    		{ text: '0→1次数',dataIndex: 'biCloseCnt', width: 100, sortable: false,hidden: true}
    	];
    	var columns = [
    		{ text: '报警状态',dataIndex: 'biAlarm',width: 100,sortable: false},
    		{ text: '统计属性',columns: StaticAttr}
    	];
    	var baseColumns = this.getBaseColumns().concat([{ text: '实时值',dataIndex: 'value',width: 150}]);
    	var temp = baseColumns.concat(this.getNormalColumns());
        return temp.concat(columns);
    },
    getRtYcColumns: function () {
    	var StaticAttr = [
    		{ text: '最大值', width: 100,dataIndex: 'biMaxVal', hidden: true},
    		{ text: '最小值', width: 100,dataIndex: 'biMinVal', hidden: true},
    		{ text: '最大值出现时间', width: 100,dataIndex: 'biMaxTime', sortable: false,hidden: true},
    		{ text: '最小值出现时间', width: 100,dataIndex: 'biMinTime', sortable: false,hidden: true},
    		{ text: '平均值', width: 100,dataIndex: 'biAverageVal', sortable: false,hidden: true}
    	];
    	var mid = [
    		{ text: '实时值',dataIndex: 'value',width: 150},
    		{ text: '单位',dataIndex: 'unit',width: 100,sortable: false}
    	];
    	var last = [
    		{ text: '转换系数',dataIndex: 'modulus',width: 100,hidden: true,sortable: false},
    		{ text: '偏移量',dataIndex: 'offset',width: 100,hidden: true,sortable: false},
    		{ text: '越限状态',dataIndex: 'overLimit',width: 200,sortable: false},
    		{ text: '统计属性',columns: StaticAttr}
    	];

    	var baseColumns = this.getBaseColumns().concat(mid);
    	var temp = baseColumns.concat(this.getNormalColumns());
        return temp.concat(last);
    },
    getRtMcColumns: function () {
    	var columns = [
    		{ text: '实时值',dataIndex: 'value',width: 150},
    		{ text: '单位',dataIndex: 'unit',width: 100,sortable: false},
    		{ text: '转换系数',dataIndex: 'modulus',width: 100,hidden: true,sortable: false}
    	];
    	
    	var baseColumns = this.getBaseColumns();
    	var temp = baseColumns.concat(columns);
        return temp.concat(this.getNormalColumns());
    },
    getYkColumns: function () {
    	var columns = [
            { text: '对应点类型',dataIndex: 'corrtype',width: 150},
            { text: '操作类型',dataIndex: 'operateType',width: 150},
            { text: '闭锁状态',dataIndex: 'blockState',width: 150},
            { text: '遥控状态',dataIndex: 'ykState',width: 150}
    	];
    	var baseColumns = this.getBaseColumns();
        return baseColumns.concat(columns);
    }

});
