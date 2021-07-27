module.exports = (passInFunc) => {
    return (req,res,next) => {
        passInFunc(req,res,next).catch(next);
    }
}