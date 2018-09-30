<?php
$params = array_merge(
    require __DIR__ . '/../../common/config/params.php',
    require __DIR__ . '/../../common/config/params-local.php',
    require __DIR__ . '/params.php',
    require __DIR__ . '/params-local.php'
);

return [
    'id' => 'app-MainEscada',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'controllerNamespace' => 'MainEscada\controllers',
    'defaultRoute'=>'site/index',
    'language'=>'zh-CN',
    'components' => [
        'request' => [
            'csrfParam' => '_csrf-MainEscada',
        ],
        'user' => [
            'identityClass' => 'common\models\usercfg',
            'enableAutoLogin' => true,
            'identityCookie' => ['name' => '_identity-MainEscada', 'httpOnly' => true],
        ],
        'session' => [
            // this is the name of the session cookie used for login on the MainEscada
            'name' => 'advanced-MainEscada',
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [
            ],
        ],
        
    ],
    'params' => $params,
];
