import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
    try{
       
        const token = req.headers.authorization.split(" ")[1];
       
        let decodeData;
        if(token){
            decodeData = jwt.verify(token, 'test');
            req.userId = decodeData?.id;
            req.email = decodeData?.email;

        }
        next()
    }catch(error){
        res.status(440).json({message: "Hết hạn token đăng nhập lại!"})
        console.log(error);

    }
}

export default auth;