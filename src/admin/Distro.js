import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore'
import '../routes/news/news.css'
import DistroTable from './distro_table';
import { useAuth } from "../components/provideAuth";
import 'react-toastify/dist/ReactToastify.css';
  

function Distro() {
    const [posts, setPosts] = useState([]);
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();

    useEffect(() => {
        if (auth.user.email) {
            const db = getFirestore();
            const q = query(collection(db, "appUsers"), where('email', '==', auth.user.email));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const items = [];
                
                querySnapshot.forEach((doc) => {
                    items.push(doc);
                });

                setAppUser(items[0].data());

            });
            return unsubscribe;
        }
    }, [auth]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, 'appDistro'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
            setPosts(items);
        });

        return unsubscribe;
    }, []);

   

    return (
        <div className='cp-form-container'>
            <div className='cp-form-wrapper'>
                                <h4 className={`text-start${posts.length !== 0 ? ' mb-4' : ' mb-0'}`}>Email Distrobution Lists ({posts.length})</h4><div className='d-flex justify-content-start filter-container'>
                        </div><DistroTable posts={posts} AppUser={AppUser} />
            </div>
        </div>
    );
}

export default Distro;