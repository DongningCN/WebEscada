/*
 * 此类动态加载数据
 */
Ext.define('WebEscada.view.runtime.Navigation', {
    extend: 'Ext.tree.Panel',
    xtype: 'runtime-navigation',
   
    viewModel: 'main',
    rootVisible: false,//设置为不可见
    width: 250,
    minWidth: 25,
    split: true,
    collapsible: true,
    cls: 'runtime-navigation',
    bind: {
    	title: '实时数据'
    },
    controller: 'runtime-navigation',
    listeners: {
    	itemexpand : 'onItemexpand',
    	select: 'onItemSelect',
    	beforerender: 'onBeforerender'
    }

});