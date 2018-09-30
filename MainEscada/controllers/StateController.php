<?php
namespace MainEscada\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\web\Response;
use yii\filters\VerbFilter;
use phpDocumentor\Reflection\Types\Array_;
use common\ExtJs;
use common\models\usercfg;
use common\models\LoginForm;

class StateController extends Controller
{
    protected $connection;
    public function actionRestore1()
    {
/*        var userId = User.Identity.GetUserId<int>();
        var q = DbContext.UserProfiles.Where(m => m.UserProfileType == (byte)UserProfileType.State && m.UserId == userId).Select(m => new
        {
            Key = m.Keyword,
            Value = m.Value
        });
        return new JObject()
        {
            { "success", true },
            { "data", JArray.FromObject(q) }
        };
*/      var_dump(Yii::$app->user);
        return false;
    }
}
    