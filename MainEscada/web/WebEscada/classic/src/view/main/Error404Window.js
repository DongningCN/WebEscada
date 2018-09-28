Ext.define('WebEscada.view.main.Error404Window', {
    extend: 'Ext.window.Window',
    xtype: 'page404',

    requires: [
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.layout.container.VBox',
        'Ext.toolbar.Spacer'
    ],
    title: I18N.AppTitle,
    titleAlign: 'center',
    maximized: true,
    modal: true,
    autoShow: true,
    closable: false,
    cls: 'error-page-container',
    layout: {
        type: 'vbox',
        align: 'center',
        pack: 'center'
    },

    items: [
        {
            xtype: 'container',
            width: 400,
            cls:'error-page-inner-container',
            layout: {
                type: 'vbox',
                align: 'center',
                pack: 'center'
            },
            items: [
                {
                    xtype: 'label',
                    cls: 'error-page-top-text',
                    text: '404'
                },
                {
                    xtype: 'label',
                    cls: 'error-page-desc',
                    html: I18N.Error404HTML
                },
                {
                    xtype: 'tbspacer',
                    flex: 1
                }
            ]
        }
    ]
});
