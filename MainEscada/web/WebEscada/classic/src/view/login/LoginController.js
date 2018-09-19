Ext.define('WebEscada.view.login.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.login',
    
    onLoginButton: function () {
        var me = this,
            f = me.getView().getForm();
        if (f.isValid()) {
            f.submit({
                url: URI.get('account', 'login'),
                waitMsg: I18N.LoginSubmitWaitMsg,
                waitTitle: I18N.LoginSubmitWaitTitle,
                success: function (form, action) {
                    window.location.reload();
                },
                failure: FAILED.form,
                scope: me
            });
        }
    },

    onResetClick:  function() {
        var me = this,
            view = me.getView(),
            f = view.getForm();
        if (f.isValid()) {
            f.submit({
                url: URI.get('account', 'passwordreset'),
                waitMsg: I18N.SaveWaitMsg,
                waitTitle: I18N.PasswordResetTitle,
                success: function (form, action) {
                    TOAST.toast(I18N.PasswordResetSuccess, view.el, null, function () {
                        window.location.reload(); 
                
                    });
                },
                failure: FAILED.form,
                scope: me
            });
        }
    },

    onReturnClick: function () {
        window.history.back();
    }


});