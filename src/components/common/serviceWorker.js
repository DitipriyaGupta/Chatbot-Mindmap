export const checkServiceWorkerSupport = () => {
  if (!("serviceWorker" in navigator)) {
    console.log("No Service Worker support!");
    return false;
  } else if (!("PushManager" in window)) {
    console.log("No Push API Support!");
    return false;
  } else return true;
};
export const registerSW = async () => {
  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
};
const notification = async () => {
  console.log(Notification.permission);
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
  } else if (Notification.permission === "default") {
    await Notification.requestPermission()
      .then(async (res) => {
        console.log(res);
        if (res === "granted") {
          console.log(res);
          await registerSW();
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
};
export const register = async () => {
  if (checkServiceWorkerSupport()) {
    await notification();
  }
};
