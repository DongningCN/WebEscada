<?php
namespace common\models;

use Yii;
use yii\base\Model;

/**
 * Login form
 */
class LoginForm extends Model
{
    public $username;
    public $password;
    public $rememberMe = false;

    private $_user;


    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            // username and password are both required
            [['username', 'password'], 'required'],
            // rememberMe must be a boolean value
            ['rememberMe', 'boolean'],
            // password is validated by validatePassword()
            ['password', 'validatePassword'],
        ];
    }

    /**
     * Validates the password.
     * This method serves as the inline validation for password.
     *
     * @param string $attribute the attribute currently being validated
     * @param array $params the additional name-value pairs given in the rule
     */
    public function validatePassword($attribute, $params)
    {
        if (!$this->hasErrors()) {
            $user = $this->getUser();
//            var_dump($this->password);
            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, 'Incorrect username or password.');
            }
        }
    }

    /**
     * Logs in a user using the provided username and password.
     *
     * @return bool whether the user is logged in successfully
     */
    public function login()
    {
//        var_dump($this->validate());
        if ($this->validate()) {
 //           var_dump(Yii::$app->user->login($this->getUser(), $this->rememberMe ? 3600 * 24 * 30 : 0));
             if($this->rememberMe)
            {
                $this->_user->generateAuthKey();
            }
            return Yii::$app->user->login($this->getUser(), $this->rememberMe ? 3600 * 24 * 30 : 0);
        }
        
        return false;
    }

    /**
     * Finds user by [[username]]
     *
     * @return User|null
     */
    protected function getUser()
    {
        if ($this->_user === null) {
            $this->_user = usercfg::findByUsername($this->username);
        }
//      var_dump($this->_user);

        return $this->_user;
    }
    //往数据库里插入用户数据，供测试用
    public function signup()
    {
        $user = new User();
        $user->username = "chen";
        $user->setPassword("dongning");
        $user->generateAuthKey();
        $user->email = "chen@chen.com";
        $user->status = 10;
        $user->password = '***';
        return $user->save() ? $user : null;
    }
    
}
