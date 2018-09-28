<?php
namespace MainEscada\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\web\Response;
use yii\filters\VerbFilter;
use yii\helpers\Url;
use phpDocumentor\Reflection\Types\Array_;
use common\ExtJs;
use common\models\User;
use common\models\LoginForm;
use Symfony\Component\CssSelector\Parser\Handler\IdentifierHandler;

class AccountController extends Controller
{
    protected $connection;
    public function actionUserinfo()
    {
        if(!Yii::$app->user->isGuest)//如果已经登录
        {
            return ExtJs::WriteObject(true,null,null,null,array(
                'UserInfo'=> array('UserName'=>"chen", 'Roles'=>'系统管理员'),
                'Menu'=> $this->getMenu()
            ));
        }

        return ExtJs::WriteObject(false);//用户未登录
    }

    public function actionLogin()
    {
        $arr = Yii::$app->request->post();
		//var_dump($arr);
        $arr1['username'] = $arr['UserName'];
        $arr1['password'] = $arr['Password'];
        $arr1['rememberMe'] = (count($arr) > 2 && $arr['RemberMe'] == 'on') ? true : false;
        $arr2['LoginForm'] = $arr1;
		//var_dump($arr2);
        $model = new LoginForm();
        if ($model->load($arr2) && $model->login()) {
			//var_dump("Login OK!!!!!!!!!!");
        } else {
            //返回错误信息，比如用户名不存在或者密码不正确
            return ExtJs::WriteObject(false);
        }
    }
    public function actionLogout()
    {
        Yii::$app->user->logout();

        return $this->goHome();
    }
    
    private function connect()
    {
        $this->connection = new \yii\db\Connection([
            'dsn' => 'mysql:host=localhost;dbname=logindb',
            'username' => 'root',
            'password' => 'dongning',
        ]);
        $this->connection->open();
    }
    private function getMenu(){
    	$ret = array ();
    	$dir = './WebEscada/resources/wiringdiagram';
    	$ret = $this->read_dir_queue($dir);
		//var_dump ($ret);
    	$result = $this->outTree ( $ret, '' );
		//var_dump ($result);
		if ( count($result) > 0 ) {
			//print_r(count ($result));
			return $result ;
		} else {
			return array ();
		}
    }
    
	//队列方式 
	private function read_dir_queue($path){
	    $handle = dir($path); //打开制定文件夹
	    $exclude = array('.', '..');  //排除选项
	    $dir = array();  //返回项
	    while(($result = $handle->read()) != false)
	    {
	        //拼装路径
	        $result_dir = $path.'/'.$result;
	        $result = iconv('GB2312', 'UTF-8', $result);
	        //排除选项及检查是否为目录
	        if (!in_array($result, $exclude) && is_dir($result_dir))
	        {
	            //递归查询目录
	            $dir[$result] = $this->read_dir_queue($result_dir);
	        }
	        elseif (!in_array($result, $exclude))
	        {
	            $dir[] = $result;
	        }
	    }
	    $handle->close();
	    return $dir;
	}
	/**
	 * 将数组以Extjs树存储结构输出
	 */
	private function outTree($array,$dir) {  // 参数是使用引用传递的
		$return  = array();
		foreach ( $array as $key => $item ) {
			if (is_array ( $item ) && !is_numeric($key)) {// 子目录
				// 记录有效目录
				$return[] = array(
						'text' => $key,
						'fullpath'=>dirname($dir.$key.'/.'),
						'expanded'=> false,
						//'iconCls'=> 'ux-file-icon',
						'allowDrag'=> false,
						'leaf' => false,
						'children'=> $this->outTree( $item ,$dir.$key.'/')
				);
			} else {
				$return[] = array(
						'text' => is_array ( $item )? $item[0] : $item,
						'id'   => is_array ( $item )? $dir.$item[0] : $dir.$item,
						'iconCls'=> 'wiring-diagram16',
						'allowDrag'=> true,
						'leaf' => true
				);
			}
		}
		return $return;
	}
    
}
