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
use common\models\usercfg;
use common\models\LoginForm;
use Symfony\Component\CssSelector\Parser\Handler\IdentifierHandler;

use MainEscada\models\station;
use MainEscada\models\yxcfg;
use MainEscada\models\yccfg;
use MainEscada\models\mccfg;
use MainEscada\models\ytcfg;
use MainEscada\models\ykcfg;
use MainEscada\models\clcfg;
use MainEscada\models\cacfg;
use MainEscada\models\cmcfg;
use MainEscada\models\channel;
use MainEscada\models\rtu;
use MainEscada\models\fixvalcfg;

class AccountController extends Controller
{
    protected $connection;
    public function actionUserinfo()
    {
    	//证明已经连接上数据库库
    	$connection=Yii::$app->db;
    	//var_dump($connection);
 		$connection->open();
	 	$command = $connection->createCommand('SELECT * FROM station');
	 	$posts = $command->queryAll();
	 	//var_dump($posts);
    	
        if(!Yii::$app->user->isGuest)//如果已经登录
        {
            return ExtJs::WriteObject(true,null,null,null,array(
                'UserInfo'=> array('UserName'=>"chen", 'Roles'=>'系统管理员'),
                'Menu'=> $this->getMenu(),
                'RtMenu' => $this->getRtMenu(),
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
        return ExtJs::WriteObject(false);//用户未登录
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
    private function getRtMenu(){
    	//厂站
    	$st = new station();
    	$station = $st::find()->all();
		//var_dump($station[0]);
    	$return = array ();
    	$child = array ();
    	$index  = 0;
		for($i=0;$i<count($station);$i++) {
			if($station[$i]['name'] == "系统数据"){
				//var_dump($station[$i]['name']);
				continue;
			}
	    	$stationid = 'flag:0:station:' . $station[$i]['no'] . ':';
	    	$temp = new yxcfg();
	    	$yx = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($yx) > 0){
				$child [] = $temp->getNode($stationid . 'yx:-1');
	    	}
	    	$temp = new yccfg();
	    	$yc = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($yc) > 0){
	    		$child [] = $temp->getNode($stationid . 'yc:-1');
	    	}
	    	$temp = new mccfg();
	    	$mc = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($mc) > 0){
	    		$child [] = $temp->getNode($stationid . 'mc:-1');
	    	}
	    	$temp = new ytcfg();
	    	$yt = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($yt) > 0){
				$child [] = $temp->getNode($stationid . 'yt:-1');
	    	}
	    	$temp = new ykcfg();
	    	$yk = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($yk) > 0){
				$child [] = $temp->getNode($stationid . 'yk:-1');
	    	}
	    	$temp = new clcfg();
	    	$cl = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($cl) > 0){
				$child [] = $temp->getNode($stationid . 'cl:-1');
	    	}
	    	$temp = new cacfg();
	    	$ca = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($ca) > 0){
				$child [] = $temp->getNode($stationid . 'ca:-1');
	    	}
	    	$temp = new cmcfg();
	    	$cm = $temp::findAll(['station' => $station[$i]['no']]);
	    	if(count($cm) > 0){
				$child [] = $temp->getNode($stationid . 'cm:-1');
	    	}
	    	
			$return[$index] = array (
					'text' => $station[$i]['name'] . '(' . $station[$i]['desc'] . ')',
					'id' => $stationid,
					'iconCls' => 'ux-icon-station',
					'expanded' => false,
					'children' => $child 
			);
			$index++;
		}
		//通道
		$chchild = array ();
		$ch = new channel();
		$channel = $ch::find()->all();
		//var_dump($channel);
		for($i=0;$i<count($channel);$i++) {
			if($channel[$i]['name'] == "虚拟通道"){
				continue;
			}
			$channelid = sprintf("flag:1:channel:%d:no:-1:frtu:-1",$channel[$i]["no"]);
			$return[$index] = array (
					'text' => $channel[$i]['name'] . '(' . $channel[$i]['desc'] . ')',
					'id' => $channelid,
					'iconCls' => 'ux-icon-channel',
					'expanded' => false,
					'children' => array() 
			);
			$temp = new rtu();
	    	$rtu = $temp::findAll(['channel' => $channel[$i]['no']]);
	    	$rtuindex = 0;
	    	for($j=0;$j<count($rtu);$j++) {
				if($rtu[$j]['name'] == "虚拟RTU"){
					continue;
				}
				$chrtus = &$return[$index]['children'];
				$chrtus [$rtuindex] = array (
						'text' => $rtu[$j]['name'] . '(' . $rtu[$j]['desc'] . ')',
						'id' => sprintf("flag:1:channel:%d:no:%d:",$channel[$i]["no"],$rtu[$j]['no']),
						'no' => $rtu[$j]["no"],
						'iconCls' => 'ux-icon-rtu',
						'expanded' => false,
						'allowDrag' => false,
						'children' => array() 
				);
				$rtuid = sprintf("flag:1:channel:%d:rtu:%d:yx:-1",$channel[$i]["no"],$rtu[$j]['no']);
				$temp = new yxcfg();
	    		$yx = $temp::findAll(['channel' => $channel[$i]['no'],'rtu' => $rtu[$j]['no']]);
		    	if(count($yx) > 0){
		    		$yxid = sprintf("flag:1:channel:%d:rtu:%d:yx:-1",$channel[$i]["no"],$rtu[$j]['no']);
					$chrtus[$rtuindex] ['children'][] = $temp->getNode($yxid);
		    	}
		    	$temp = new yccfg();
		    	$yc = $temp::findAll(['channel' => $channel[$i]['no'],'rtu' => $rtu[$j]['no']]);
		    	if(count($yc) > 0){
		    		$ycid = sprintf("flag:1:channel:%d:rtu:%d:yc:-1",$channel[$i]["no"],$rtu[$j]['no']);
					$chrtus[$rtuindex] ['children'][] = $temp->getNode($ycid);
		    	}
		    	$temp = new mccfg();
		    	$mc = $temp::findAll(['channel' => $channel[$i]['no'],'rtu' => $rtu[$j]['no']]);
		    	if(count($mc) > 0){
		    		$mcid = sprintf("flag:1:channel:%d:rtu:%d:mc:-1",$channel[$i]["no"],$rtu[$j]['no']);
					$chrtus[$rtuindex] ['children'][] = $temp->getNode($mcid);
		    	}
		    	$temp = new ytcfg();
		    	$yt = $temp::findAll(['channel' => $channel[$i]['no'],'rtu' => $rtu[$j]['no']]);
		    	if(count($yt) > 0){
		    		$ytid = sprintf("flag:1:channel:%d:rtu:%d:yt:-1",$channel[$i]["no"],$rtu[$j]['no']);
					$chrtus[$rtuindex] ['children'][] = $temp->getNode($ytid);
		    	}
		    	$temp = new ykcfg();
		    	$yk = $temp::findAll(['channel' => $channel[$i]['no'],'rtu' => $rtu[$j]['no']]);
		    	if(count($yk) > 0){
		    		$ykid = sprintf("flag:1:channel:%d:rtu:%d:yk:-1",$channel[$i]["no"],$rtu[$j]['no']);
					$chrtus[$rtuindex] ['children'][] = $temp->getNode($ykid);
		    	}
		    	$temp = new fixvalcfg();
		    	$fix = $temp::findAll(['channel' => $channel[$i]['no'],'rtu' => $rtu[$j]['no']]);
		    	if(count($fix) > 0){
		    		$fixid = sprintf("flag:1:channel:%d:rtu:%d:ft:-1",$channel[$i]["no"],$rtu[$j]['no']);
					$chrtus[$rtuindex] ['children'][] = $temp->getNode($fixid);
		    	}
		    	
		    	$rtuindex++;
	    	}
	    	$index++;
		}
				
		return $return;
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
