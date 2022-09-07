const {secret} = require('../config')
const jwt = require('jsonwebtoken')
module.exports = function (roles){
    return function(req,res,next){
        if(req.method === "OPTIONS"){
            next()
        }
        try{
            let token = req.headers.authorization.split(' ')[1]
            if(!token){
                return res.status(403).json({message: "У пользователя нет права для авторизации"})
            }
            const {roles: userRoles} = jwt.verify(token,secret)
            let hasrole = false
            userRoles.forEach(role => {
                if(roles.includes(role)){
                    hasrole = true
                }
            })
            if(!hasrole){
                return res.status(403).json({message : "У пользователя нет прав для авторизации"})
            }
            next()
    
        }catch(e){
            console.log(e)
            return res.status(403).json({message: "У пользователя нет права для авторизации"})
        }
    }
   
}