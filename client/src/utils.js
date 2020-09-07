export const isLogin = () => {
    const userId = sessionStorage.getItem('userId')
    if (userId === null) {
        return false;
    }
    else if (userId === undefined)
    {
        return false;
    } else {
        return true;  

    }
}