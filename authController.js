const User = require('./models/User')
const Role = require('./models/Role')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator');
const {secret} = require('./config.js')


const generateAccessToken = (id,roles) => {
    const payload = {
        id,roles
    }
    return jwt.sign(payload,secret,{expiresIn:"24h"})
}

class AuthController {
    async registration(req,res){
        try{
            const erorrs = validationResult(req)
            if(!erorrs.isEmpty()){
                return  res.status(400).json({message: "Ошибка при регистрации",erorrs})
            }
            const {username,password} = req.body
            const candidate = await User.findOne({username})
            if(candidate){
                return  res.status(400).json({message:"Пользователь с таким именем уже существует"})
            }
            
            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = await Role.findOne({value:"USER"})
            const user = new User({username,password:hashPassword,roles:[userRole.value]})
            await user.save()
            res.json('Пользователь успешно создан')
        }catch(e){
            console.log(e)
            req.status(400).json({message:"Registration error"})
        }
    }
    async login(req,res){
        try{
            const {username,password} = req.body
            const checkUser = await User.findOne({username})
            if(!checkUser){
                return res.status(400).json({message: `Пользователь ${username} не найден`})
            }
            const validPassword = bcrypt.compareSync(password,checkUser.password)
            if(!validPassword){
                return res.status(400).json({message: "вы ввели не правильное имя или пароль"})
            }

            const token = generateAccessToken(checkUser._id,checkUser.roles)
            return res.json({token})

        }catch(e){
            console.log(e)
            res.status(400).json({message:"Login error"})
        }
    }
    async getUsers(req,res){
        try{
            const users = await User.find()
            res.json(users)
        }catch(e){
            console.log(e)
        }
    }
}

module.exports = new AuthController()