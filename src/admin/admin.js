import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { deleteDoc, getFirestore, collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import '../routes/news/news.css'
import AdminTable from './admin_table';
import {sendEmailApprover} from './index';
import { useAuth } from "../components/provideAuth";
import { sendPasswordResetEmail, createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
  

function Admin() {
    const email = useRef();
    const note = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const status = useRef();
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
    const [formLoading, setFormLoading] = useState(true);
    const name = useRef();
    const roles = useRef();
    const auths = getAuth();



    useEffect(() => {
        if (auth.user.email) {
            const db = getFirestore();
            const q = query(collection(db, "appUsers"), where('email', '==', auth.user.email));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const items = [];
                
                querySnapshot.forEach((doc) => {
                    items.push(doc);
                });

                setFormLoading(false);
                setAppUser(items[0].data());

            });
            return unsubscribe;
        }
    }, [auth]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, 'appUsers'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
            setPosts(items);
            setCache(items);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (searchQuery) {
            console.log('Filter query: ', searchQuery);
            const queryUpperCase = searchQuery.toUpperCase();

            const filtered = cache.filter(entry => {
                return entry.data()?.email?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.name?.toUpperCase().includes(queryUpperCase)
            });

            setPosts(filtered);
        } else {
            setPosts(cache);
        }
    }, [searchQuery, cache]);

    function onSearch(event) {
        setSearchQuery(event.target.value);
    }

    return (
        <div className='cp-form-container'>
            <div className='cp-form-wrapper'>
            {
                    formLoading &&
                    <div style={{ height: 488 }} className='d-flex align-items-center justify-content-center w-100'>
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                }
                                 { 
                                 AppUser?.roles?.includes('SysAdmin') ?

                <div className='cp-form-inner mb-5 mt-4'>
                    <div>
                        <h3 className='mb-4'>New Admin Users </h3>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Name</span>
                            <textarea className="form-control" rows="1" ref={name}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Email Address</span>
                            <textarea className="form-control" rows="1" ref={email}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Role</span>
                            <select className='form-select' id='group' multiple={false} ref={roles} >
                            <option value='Publisher'>Content Publisher</option>
                            <option value='Approver'>Content Approver</option>
                            <option value='NewsletterPublisher'>Newsletter Publisher</option>
                            <option value='SysAdmin'>System Admin</option>
                                </select>
                                
                        </div>
                        <div className='input-group mb-2 '>
                                <label className='input-group-text w-25' htmlFor='group'>Published Status</label>
                                {
                                    AppUser?.roles?.includes('SysAdmin') ?
                                    <select className='form-select' id='group' ref={status} >
                                        <option value='Awaiting Approval'>Submit for approval</option>
                                        <option value='Approved'>Approved</option>
                                        {/* <option value='Archived'>Archived</option> */}
                                    </select> :
                                    <select className='form-select' id='group' ref={status} >
                                        <option value='Awaiting Approval'>Submit for approval</option>
                                        {/* <option value='Archived'>Archived</option> */}
                                    </select>
                                }
                            </div>
                        <button
                            type='button'
                            className='btn btn-success w-100 round-10'
                            ref={uploadButton}
                            onClick={async (event) => {                                
                                // Create Firestore document, holds file metadata
                                const data = {
                                    name: name.current.value,
                                    email: email.current.value,
                                    date: serverTimestamp(),
                                    publishedBy: AppUser?.name,
                                    publishedOn: serverTimestamp(), 
                                    status: status.current.value,
                                    roles:roles.current.value,
                                    password: Math.random().toString(36).slice(4)
                                };

                                if (status.current.value === 'Approved') {
                                    data.approvedBy = AppUser.name;
                                    data.approvedOn = serverTimestamp();
                                    data.status = 'Approved';
                                createUserWithEmailAndPassword(auths, email.current.value, Math.random().toString(36).slice(4)); 
                                sendPasswordResetEmail(auths, email.current.value);    
                            }else{
                                sendEmailApprover('USMCDAIMobileApp@aeyon.us', "New Admin User Entry");
                            }
                            const docRef = await addDoc(collection(getFirestore(), 'appUsers'), data);
                            console.log('Document written with ID: ', docRef.id);
                                // Reset fields
                                name.current.value = '';
                                email.current.value = '';
                                status.current.value = 'Awaiting Approval';
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
                : " " }

{
                    AppUser?.roles?.includes('SysAdmin') &&
                    <div className='d-flex flex-column mt-3 w-100 mb-5' style={{ maxWidth: 820}}>
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Admin Users awaiting approval ({posts.filter(entry => entry.data().status === 'Awaiting Approval').length})</strong>
                        </div> 
                        {
                            posts
                            .filter(entry => entry.data().status === 'Awaiting Approval')
                            .map(entry => {
                                const { id } = entry;

                                const {
                                    name,
                                    email,
                                    roles,
                                    notes
                                } = entry.data();

                                return (
                                    <div key={id} className='mb-4 alert alert-danger' style={{ borderRadius: 20, padding: 20 }}>
                                        <div className='mb-3'>
                                            <label>Name</label>
                                            <div>{name}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>E-Mail</label>
                                            <div>{email}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Roles</label>
                                            <div>{roles}</div>
                                        </div>
                                        <div className='mb-3'>
                                        <label>Approver Notes</label>
                                        <textarea className="form-control" rows="6" value={notes} ref={note}></textarea>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-33 round-10`}
                                            onClick={event => {
                                                updateDoc(
                                                    doc(getFirestore(), 'appUsers', id),
                                                    {
                                                        notes: note.current.value,
                                                        status: 'Approved',
                                                        approvedBy: AppUser.name,
                                                        approvedOn: serverTimestamp(),
                                                    }
                                                );
                                                createUserWithEmailAndPassword(auths, email, Math.random().toString(36).slice(4)); 
                                                sendPasswordResetEmail(auths, email); 
                                            }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                type='button'
                                style={{marginLeft:5}}
                                className='btn btn-danger w-33 btn-sm round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    const docRef = doc(getFirestore(), 'appUsers', id);
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        toast.success('The user has been successfully deleted.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });
                                    })
                                      .catch(error => {
                                        toast.error('An error has occured, Please try again.\n\n'+error, {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });
                                      })
                                }}
                            >
                                Delete
                            </button>
                            <button
                                            className={`btn btn-warning btn-sm w-33 round-10`}
                                            onClick={event => {
                                                updateDoc(
                                                    doc(getFirestore(), 'appUsers', id),
                                                    {
                                                        notes: note.current.value,
                                                        status: 'Not Approved',
                                                        approvedBy: AppUser.name,
                                                        approvedOn: serverTimestamp()

                                                    }
                                                );
                                            }}
                                        >
                                            Dispprove
                                        </button>
                            <ToastContainer />
                                    </div>
                                )
                            })
                        }
                    </div>
                }
                                <h4 className={`text-start${posts.length !== 0 ? ' mb-4' : ' mb-0'}`}>Admin Users ({posts.length})</h4>

                <div className='d-flex justify-content-start filter-container'>
                <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search Users' title='Search Users' ref={searchField} onChange={onSearch}/>
                    </div>
                </div>
                <AdminTable posts={posts} AppUser={AppUser} searchQuery={searchQuery} />
            </div>
        </div>
        
    );
}

export default Admin;