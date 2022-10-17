import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { deleteDoc, getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, where, doc, updateDoc, orderBy } from 'firebase/firestore'
import './upk-usmc.css'
import UPKUSMCTable from './upk-usmc-table';
import { useAuth } from "../../components/provideAuth";
import {sendEmailApprover} from '../../admin/index';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function UPKUSMC() {
    const module = useRef();
    const description = useRef();
    const docID = useRef();
    const ids = useRef();
    const tags = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
    const [formLoading, setFormLoading] = useState(true);
    const status = useRef();
    const [postsCount, setPostsCount] = useState(0);
    const note = useRef();
    const [adminEmail, setadminEmail] = useState('');

    useEffect(() => {
        if (auth.user.email) {
            const db = getFirestore();
            const q = query(collection(db, "appDistro"), where('roles', '==', 'Approver'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const items = [];
                querySnapshot.forEach((doc) => {
                    items.push(doc);
                });
                setadminEmail(items[0].email);
            });
            return unsubscribe;
        }
    },[auth]);
    useEffect(() => {
        if (auth.user.email) {
            const db = getFirestore();
            const q = query(collection(db, "appUsers"), where('email', '==', auth.user.email));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
        const q = query(collection(db, 'upktraining'), orderBy('approved', 'desc'), orderBy('module'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            setPostsCount(querySnapshot.size + 1);

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
                return entry.data()?.description?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.description?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.docID?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.ids?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.module?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.tags?.toUpperCase().includes(queryUpperCase)
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
                 { AppUser?.roles?.includes('Publisher') ?
                <div className='cp-form-inner mb-5 mt-4'>
                    <div>
                        <h3 className='mb-4'>New UPK & SPD</h3>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Module UID</span>
                            <input className="form-control" placeholder="1c4dbeb0-1ae1-44be-99ea-6cd47cd8da89" ref={docID}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Description</span>
                            <textarea className="form-control" rows="6" ref={description}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>UPK/SPD Title</span>
                            <input type="text" className="form-control" ref={module}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>TAGs</span>
                            <input type="text" className="form-control" placeholder="Seperate by Comma" ref={tags}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Auto ID</span>
                            <input disabled value={postsCount} type="number" className="form-control" placeholder='0' ref={ids}></input>
                        </div>
                        <div className='input-group mb-3'>
                                <label className='input-group-text' htmlFor='group'>Published Status</label>
                                {
                                    AppUser?.roles?.includes('Approver') ?
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
                                const db = getFirestore();

                                const data = {
                                    description: description.current.value,
                                    docID: docID.current.value,
                                    ids: ids.current.value,
                                    module: module.current.value,
                                    tags: tags.current.value,
                                    publishedBy:AppUser.name,
                                    publishedOn:serverTimestamp(),
                                    approved: status.current.value,
                                    approvedBy: "", 
                                    approvedOn: ""
                                };

                                if (status.current.value === 'Approved') {
                                    data.approvedBy = AppUser.name;
                                    data.approvedOn = serverTimestamp();
                                    data.approved = 'Approved';
                                }else{
                                    sendEmailApprover(adminEmail, "New UPK/SPD Entry");
                                }

                                const docRef = await addDoc(collection(db, 'upktraining'), data);

                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                docID.current.value = '';
                                description.current.value = '';
                                ids.current.value = '';
                                module.current.value = '';
                                tags.current.value = '';
                                status.current.value = 'Awaiting Approval';
                            }}
                        >
                            Post
                        </button>
                    </div>
                </div> 
            : "" }

{
                    AppUser?.roles?.includes('Approver') &&
                    <div className='d-flex flex-column mt-3 w-100 mb-5' style={{ maxWidth: 820}}>
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>UPK & SDPs  awaiting approval ({posts.filter(entry => entry.data().approved === 'Awaiting Approval').length})</strong>
                        </div> 
                        {
                            posts
                            .filter(entry => entry.data().approved === 'Awaiting Approval')
                            .map(entry => {
                                const { id } = entry;

                                const {
                                    docID,
                                    description,
                                    module,
                                    tags,
                                    notes
                                } = entry.data();

                                return (
                                    <div key={id} className='mb-4 alert alert-danger' style={{ borderRadius: 20, padding: 20 }}>
                                        <div className='mb-3'>
                                            <label>Module UID</label>
                                            <div>{docID}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Description</label>
                                            <div>{description}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Module Title</label>
                                            <div>{module}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Tags</label>
                                            <div>{tags}</div>
                                        </div>
                                        <div className='mb-3'>
                                        <label>Approver Notes</label>
                                        <textarea className="form-control" rows="6" value={notes} ref={note}></textarea>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-33 round-10`}
                                            onClick={event => {
                                                updateDoc(
                                                    doc(getFirestore(), 'upktraining', id),
                                                    {
                                                        notes: note.current.value,
                                                        approved: 'Approved',
                                                        approvedBy: AppUser.name,
                                                        approvedOn: serverTimestamp()
                                                    }
                                                );
                                            }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                type='button'
                                style={{marginLeft:5}}
                                className='btn btn-danger btn-sm w-33 round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    const docRef = doc(getFirestore(), 'upktraining', id);
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        toast.success('The entry has been successfully deleted.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });                                    })
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
                                                    doc(getFirestore(), 'upktraining', id),
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

                <div className='d-flex justify-content-start filter-container'>
                <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search Posts' title='Search Posts' ref={searchField} onChange={onSearch}/>
                    </div>
                </div>
                <UPKUSMCTable posts={posts} AppUser={AppUser} searchQuery={searchQuery} />

            </div>
        </div>
    );
}

export default UPKUSMC;