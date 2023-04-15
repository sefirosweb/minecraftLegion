
export const getCurrentDate = () => {
    const date = new Date();
    const time = ("0" + date.getHours()).slice(-2) + ":" + ("0" + (date.getMinutes() + 1)).slice(-2) + ":" + ("0" + (date.getSeconds() + 1)).slice(-2);
    return time
}