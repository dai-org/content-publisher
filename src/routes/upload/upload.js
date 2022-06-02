import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getFirestore, collection, onSnapshot, query, where, serverTimestamp} from 'firebase/firestore'
import { useHistory } from "react-router-dom";
import './upload.css'
import { useAuth } from "../../components/provideAuth";

function Upload() {
    const [dataDictionaryCount, setDataDictionaryCount] = useState(0);
    const [dataDictionaryAwaiting, setDataDictionaryAwaiting] = useState(0);
    const [faqCount, setFaqCount] = useState(0);
    const [newsletterCount, setNewsletterCount] = useState(0);
    const [unapprovedNewsletterCount, setUnapprovedNewsletterCount] = useState(0);
    const [unapprovedUPKCount, setUnapprovedUPKCount] = useState(0);
    const [unapprovedpostsCount, setUnapprovedpostsCount] = useState(0);
    const [unapprovedEventsCount, setunapprovedEventsCount] = useState(0);
    const [postsCount, setPostsCount] = useState(0);
    const [unapprovedFAQCount, setUnapprovedFAQCount] = useState(0);
    const [upkCount, setupkCount] = useState(0);
    const [eventsCount, seteventsCount] = useState(0);
    var [systemStatus, setsystemStatus] = useState("0");
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
    const [formLoading, setFormLoading] = useState(true);

    // const [lastDictionary, setLastDictionary] = useState(null);
    // const [lastFaq, setLastFaq] = useState(null);
    // const [lastNewsletter, setLastNewsletter] = useState(null);
    // const [lastTraining, setLastTraining] = useState(null);
    // const [lastReference, setLastReference] = useState(null);

    const history = useHistory();

    useEffect(() => {
        if (auth.user.email) {
            const db = getFirestore();
            const q = query(collection(db, "appUsers"), where('email', '==', auth.user.email));
            const unsubscribe = onSnapshot(q, { includeMetadataChanges: true },(querySnapshot) => {
                const items = [];
                
                querySnapshot.forEach((doc) => {
                    items.push(doc);
                });

                console.log(items[0].data());

                setFormLoading(false);
                setAppUser(items[0].data());
            });

            return unsubscribe;
        }
    }, [auth]);


    useEffect(() => {
        const db = getFirestore();
        const dataDictionary = query(collection(db, "dataDictionary"));
        const unsubscribe = onSnapshot(dataDictionary, { includeMetadataChanges: true },(querySnapshot) => { 
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
        const dataDictionary = query(collection(db, "faq"));
        const unsubscribe = onSnapshot(dataDictionary, { includeMetadataChanges: true },(querySnapshot) => { 
            setFaqCount(querySnapshot.size);

            let awaiting = 0;
                
            querySnapshot.forEach((doc) => {
                if (doc.data().status === 'Awaiting Approval') {
                    awaiting++;
                }
            });

            setUnapprovedFAQCount(awaiting);
        });

        return unsubscribe;
    }, []);


    useEffect(() => {
        const db = getFirestore();
        const dataDictionary = query(collection(db, "systemStatus"));
        const unsubscribe = onSnapshot(dataDictionary, { includeMetadataChanges: true },(querySnapshot) => {                 
            querySnapshot.forEach((doc) => {
                    setsystemStatus(doc.data().status);
            });
        });
        return unsubscribe;
    }, []);


    useEffect(() => {
        const db = getFirestore();
        const dataDictionary = query(collection(db, "newsletters"));
        const unsubscribe = onSnapshot(dataDictionary, { includeMetadataChanges: true },(querySnapshot) => { 
            setNewsletterCount(querySnapshot.size);

            let awaiting = 0;
                
            querySnapshot.forEach((doc) => {
                if (doc.data().status === 'Awaiting Approval') {
                    awaiting++;
                }
            });

            setUnapprovedNewsletterCount(awaiting);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const db = getFirestore();
        const dataDictionary = query(collection(db, "posts"));
        const unsubscribe = onSnapshot(dataDictionary, { includeMetadataChanges: true },(querySnapshot) => { 
            setPostsCount(querySnapshot.size);

            let awaiting = 0;
                
            querySnapshot.forEach((doc) => {
                if (doc.data().status === 'Awaiting Approval') {
                    awaiting++;
                }
            });

            setUnapprovedpostsCount(awaiting);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const db = getFirestore();
        const dataDictionary = query(collection(db, "events"));
        const unsubscribe = onSnapshot(dataDictionary, { includeMetadataChanges: true },(querySnapshot) => { 
            seteventsCount(querySnapshot.size);

            let awaiting = 0;
                
            querySnapshot.forEach((doc) => {
                if (doc.data().status === '0') {
                    awaiting++;
                }
            });

            setunapprovedEventsCount(awaiting);
        });

        return unsubscribe;
    }, []);


    useEffect(() => {
        const db = getFirestore();
        const dataDictionary = query(collection(db, "upktraining"),);
        const unsubscribe = onSnapshot(dataDictionary, { includeMetadataChanges: true },(querySnapshot) => { 
            setupkCount(querySnapshot.size);

            let awaiting = 0;
                
            querySnapshot.forEach((doc) => {
                if (doc.data().approved === 'Awaiting Approval') {
                    awaiting++;
                }
            });

            setUnapprovedUPKCount(awaiting);
        });

        return unsubscribe;
    }, []);

   function handleChange(e) {
       console.log(e.target.value)
    setsystemStatus(e.target.value);
      }

    return (
        <div className='upload-container'>
            <div className='upload-wrapper'>
            {
                    formLoading &&
                    <div style={{ height: 488 }} className='d-flex align-items-center justify-content-center w-100'>
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                }
           { AppUser?.roles?.includes('Approver') ?
            <div className='input-group upload-inner'>
                                <label className='input-group-text' htmlFor='status'>Status</label>
                                <select onChange={handleChange} className='form-select' id='status' value={systemStatus}>
                                    <option value='1'>DAI is Up</option>
                                    <option value='0'>DAI is Down</option>
                                </select>
                                <button
                                type='button'
                                style= {{marginLeft: 20}}
                                className='btn btn-success w-0 round-10'
                                onClick={async (event) => {
                                    
                                    alert("DAI System Status has been saved.");

                                        updateDoc(
                                            doc(getFirestore(), 'systemStatus', "V98yReepMp7MKYQwRPLJ"),
                                            {
                                                status:  systemStatus,
                                                approvedOn:  serverTimestamp(),
                                                approvedBy:  AppUser.name
                                            }
                                        );
                                    }}
                                >Save Status</button>
                            </div>
 : ""
 }
                <div className='upload-inner pointer' onClick={event => { history.push('/data-dictionary'); }}>
                    <div>
                        <h5 className='mb-0'>Data Dictionary
                        <div class="col-lg-0">
                        <span className="badge alert-danger">{dataDictionaryAwaiting}</span>
                        <span style= {{marginLeft: 10}} className="badge bg-secondary">{dataDictionaryCount}</span>
                        </div>
                        </h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/faqs'); }}>
                    <div>
                        <h5 className='mb-0'>FAQs 
                        <div class="col-lg-0">
                        <span className="badge alert-danger">{unapprovedFAQCount}</span>
                        <span style= {{marginLeft: 10}} className="badge bg-secondary">{faqCount}</span>
                        </div>
                        </h5>
                </div>
            </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/newsletters'); }}>
                    <div>
                        <h5 className='mb-0'>Newsletters 
                        <div class="col-lg-0">
                        <span className="badge alert-danger">{unapprovedNewsletterCount}</span>
                        <span style= {{marginLeft: 10}} className="badge bg-secondary">{newsletterCount}</span>
                        </div>
                        </h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/posts'); }}>
                    <div>
                        <h5 className='mb-0'>Posts
                        <div class="col-lg-0">
                        <span className="badge alert-danger">{unapprovedpostsCount}</span>
                        <span style= {{marginLeft: 10}} className="badge bg-secondary">{postsCount}</span>
                        </div>
                        </h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/usmc-events'); }}>
                    <div>
                        <h5 className='mb-0'>DAI Event Calendar
                        <div class="col-lg-0">
                        <span className="badge alert-danger">{unapprovedEventsCount}</span>
                        <span style= {{marginLeft: 10}} className="badge bg-secondary">{eventsCount}</span>
                        </div>
                        </h5>
                </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/upk-usmc'); }}>
                    <div>
                    <h5 className='mb-0'>DAI USMC UPK and SDPs
                        <div class="col-lg-0">
                        <span className="badge alert-danger">{unapprovedUPKCount}</span>
                        <span style= {{marginLeft: 10}} className="badge bg-secondary">{upkCount}</span>
                        </div>
                        </h5>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Upload;