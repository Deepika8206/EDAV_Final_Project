import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
apiKey: "AIzaSyB6GsOBDkyl5dzG323LOShz4aAZ3c74efs",
authDomain: "YOUR_PROJECT.firebaseapp.com",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_PROJECT.appspot.com",
messagingSenderId: "SENDER_ID",
appId: "APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);