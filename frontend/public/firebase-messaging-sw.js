importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js");

try {
  firebase.initializeApp({
    apiKey: "AIzaSyDyulfcsQ9K-BwYhHDb9hUCckMZpxWrZeQ",
    authDomain: "valdi-bfdee.firebaseapp.com",
    projectId: "valdi-bfdee",
    storageBucket: "valdi-bfdee.appspot.com",
    messagingSenderId: "865302377509",
    appId: "1:865302377509:web:022b7bc80f5ea2e0cdbbcc",
    measurementId: "G-YCZ319P1Q7",
  });
  const messaging = firebase.messaging();
  messaging.setBackgroundMessageHandler(function (payload) {
    const notificationTitle = payload.data.username;
    const notificationOptions = {
      body: payload.data.message,
      icon: "public/assets/icon/logo.png",
    };

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });
} catch (err) {
  console.log(err);
}
