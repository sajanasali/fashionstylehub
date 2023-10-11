

const isLoginAdmin = async (req, res, next) => {
    try {
        if (req.session.admin) {
           
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
    finally{
        next()
    }
}
const isLogoutAdmin = async (req, res, next) => {
    try {
        if (req.session.admin) {
            res.redirect('/adminhome');
        }
       
    } catch (error) {
        console.log(error.message);
    }
    finally{
        next();
    }
}
module.exports = {
    isLoginAdmin,
    isLogoutAdmin
}