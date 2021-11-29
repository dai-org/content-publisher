import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore'
import { useHistory } from "react-router-dom";
import './upload.css'

function Upload() {
    const [dataDictionaryCount, setDataDictionaryCount] = useState(0);
    const [dataDictionaryAwaiting, setDataDictionaryAwaiting] = useState(0);
    const [faqCount, setFaqCount] = useState(0);
    const [newsletterCount, setNewsletterCount] = useState(0);
    const [postsCount, setPostsCount] = useState(0);
    const [trainingGuideCount, setTrainingGuide] = useState(0);
    const [referenceGuideCount, setReferenceGuide] = useState(0);

    // const [lastDictionary, setLastDictionary] = useState(null);
    // const [lastFaq, setLastFaq] = useState(null);
    // const [lastNewsletter, setLastNewsletter] = useState(null);
    // const [lastTraining, setLastTraining] = useState(null);
    // const [lastReference, setLastReference] = useState(null);

    const history = useHistory();

    useEffect(() => {
        const db = getFirestore();
        const dataDictionary = query(collection(db, "dataDictionary"));
        const unsubscribe = onSnapshot(dataDictionary, (querySnapshot) => { 
            setDataDictionaryCount(querySnapshot.size);

            let awaiting = 0;
                
            querySnapshot.forEach((doc) => {
                if (doc.data().status === 'Awaiting Approval') {
                    awaiting++;
                }
            });

            setDataDictionaryAwaiting(awaiting);
        });

        return unsubscribe;
    }, []);
    
    useEffect(() => {
        const db = getFirestore();
        const faq = query(collection(db, "faq"));
        const unsubscribe = onSnapshot(faq, (querySnapshot) => { setFaqCount(querySnapshot.size) });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const db = getFirestore();
        const newsletters = query(collection(db, "newsletters"));
        const unsubscribe = onSnapshot(newsletters, (querySnapshot) => { setNewsletterCount(querySnapshot.size) });

        return unsubscribe;
    }, []);
   
    useEffect(() => {
        const db = getFirestore();
        const training = query(collection(db, "posts"));
        const unsubscribe = onSnapshot(training, (querySnapshot) => { setPostsCount(querySnapshot.size) });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const db = getFirestore();
        const referenceGuides = query(collection(db, "referenceGuides"));
        const unsubscribe = onSnapshot(referenceGuides, (querySnapshot) => { setReferenceGuide(querySnapshot.size) });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const db = getFirestore();
        const training = query(collection(db, "training"));
        const unsubscribe = onSnapshot(training, (querySnapshot) => { setTrainingGuide(querySnapshot.size) });

        return unsubscribe;
    }, []);

    return (
        <div className='upload-container'>
            <div className='upload-wrapper'>
                <div className='upload-inner pointer' onClick={event => { history.push('/data-dictionary'); }}>
                    <div>
                        <h5 className='mb-0'>Data Dictionary <span className="badge bg-secondary">{dataDictionaryCount}</span></h5>
                    </div>
                    {
                        dataDictionaryAwaiting !== 0 &&
                        <div className='alert alert-danger w-100 mb-0 mt-3 p-1 pe-4 ps-4' style={{ textAlign: 'center' }}>
                            Awaiting approval ({dataDictionaryAwaiting})
                        </div>
                    }
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/faqs'); }}>
                    <div>
                        <h5 className='mb-0'>FAQs <span className="badge bg-secondary">{faqCount}</span></h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/newsletters'); }}>
                    <div>
                        <h5 className='mb-0'>Newsletters <span className="badge bg-secondary">{newsletterCount}</span></h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/posts'); }}>
                    <div>
                        <h5 className='mb-0'>Posts<span className="badge bg-secondary">{postsCount}</span></h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/reference-guides'); }}>
                    <div>
                        <h5 className='mb-0'>Reference Guides <span className="badge bg-secondary">{referenceGuideCount}</span></h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/training-guides'); }}>
                    <div>
                        <h5 className='mb-0'>Training Guides <span className="badge bg-secondary">{trainingGuideCount}</span></h5>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Upload;