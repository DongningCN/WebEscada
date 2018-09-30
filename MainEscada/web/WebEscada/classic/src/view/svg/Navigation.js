/*
 * 此类动态加载数据
 */
Ext.define('WebEscada.view.svg.Navigation', {
    extend: 'Ext.tree.Panel',
    xtype: 'left-navigation',
   
    viewModel: 'main',
    rootVisible: false,//设置为不可见
    width: 250,
    minWidth: 25,
    split: true,
    collapsible: true,
    cls: 'left-navigation',
    store: 'NavigationTree',
    bind: {
    	title: '主接线图'
    },
    controller: 'navigation',
    listeners: {
    	itemexpand : 'onItemexpand',
    	select: 'onItemSelect',
    	beforerender: 'onBeforerender'
    }

});