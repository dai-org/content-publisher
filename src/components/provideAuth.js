import React, { useState, useEffect, useContext, createContext } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED} from "firebase/firestore"; 
import { toast } from 'react-toastify';

// Add your Firebase credentials
const app = initializeApp({
    apiKey: 'AIzaSyA71Gd5pJvkYIpuqdMmi1hA-TXPJouLEo8',
    authDomain: 'dai-app-8f509.firebaseapp.com',
    projectId: 'dai-app-8f509',
    storageBucket: 'dai-app-8f509.appspot.com',
    messagingSenderId: '179206889396',
    appId: '1:179206889396:web:abafe2ab079fc492b51ce1',
    measurementId: 'G-0C5K8FKX50',
    merge: true
});
const firestoreDb = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  });
enableIndexedDbPersistence(firestoreDb)
.catch((err) => {
  console.log(err.code);
  if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      // ...
  } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      // ...
  }
});
const auth = getAuth();
setPersistence(auth, browserLocalPersistence);

const authContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
    const authUser = Object.keys(localStorage).filter(item => item.startsWith('firebase:authUser'))[0];
    const [user, setUser] = useState(localStorage.getItem(authUser));

    // Wrap any Firebase methods we want to use making sure ...
    // ... to save the user to state.


    const signin = async (email, password) => {

        const auth = getAuth();
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        // await setPersistence(auth, browserLocalPersistence)
        const response = await signInWithEmailAndPassword(auth, email, password)
        .catch((err) => {
            setUser("");
            toast.error('An error has occured with deleting this user, Please try again.\n\n'+err, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: 0,
                });
        }
        );
        try {
        setUser(response.user);
        }catch (err) {
            
        }
        return user;

    };

    const signout = async () => {
        const auth = getAuth();
        await signOut(auth);
        setUser(false);
    };

    // Subscribe to user on mount
    // Because this sets state in the callback it will cause any ...
    // ... component that utilizes this hook to re-render with the ...
    // ... latest auth object.
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Return the user object and auth methods
    return {
        user,
        signin,
        signout
    };
}
