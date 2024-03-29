import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { deleteDoc, getFirestore, collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import './news.css'
import NewsTable from './news-table';
import { useAuth } from "../../components/provideAuth";
import {sendEmailApprover} from '../../admin/index';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function News() {
    const subject = useRef();
    const maradminid = useRef();
    const body = useRef();
    const video = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const status = useRef();
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
    const [formLoading, setFormLoading] = useState(true);
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
        const q = query(collection(db, 'posts'), orderBy('status', 'desc'), );
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
                return entry.data()?.subject?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.body?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.author?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.video?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.maradminid?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.date?.toDate().toLocaleString()?.toUpperCase().includes(queryUpperCase)
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
                        <h3 className='mb-4'>New Post</h3>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Subject</span>
                            <textarea className="form-control" rows="1" ref={subject}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Body</span>
                            <textarea className="form-control" rows="6" ref={body}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Video/MarAdmin URL</span>
                            <textarea placeholder="http://www.website.com (Leave Blank, if there is no URL)" className="form-control" rows="1" ref={video}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>MarAdmin ID</span>
                            <textarea placeholder="245/34 (Leave Blank, if not MarAdmin)" className="form-control" rows="1" ref={maradminid}></textarea>
                        </div>

                        <div className='input-group mb-2 '>
                                <label className='input-group-text w-25' htmlFor='group'>Published Status</label>
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
                                // Create Firestore document, holds file metadata
                                const db = getFirestore();
                                const data = {
                                    subject: subject.current.value,
                                    body: body.current.value,
                                    video: (video.current.value.length > 0) ? video.current.value : "undefined",
                                    maradminid: (maradminid.current.value.length > 0) ? maradminid.current.value : "undefined",
                                    date: serverTimestamp(),
                                    publishedBy: AppUser?.name,
                                    publishedOn: serverTimestamp(), 
                                    status: status.current.value,
                                    type: "Info"

                                };

                                if (status.current.value === 'Approved') {
                                    data.approvedBy = AppUser.name;
                                    data.approvedOn = serverTimestamp();
                                    data.status = 'Approved';
                                }else{
                                    sendEmailApprover(adminEmail, "New News/Post Entry");
                                }
                                const docRef = await addDoc(collection(db, 'posts'), data);
                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                subject.current.value = '';
                                body.current.value = '';
                                video.current.value = '';
                                maradminid.current.value = '';
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
                            <strong>Posts awaiting approval ({posts.filter(entry => entry.data().status === 'Awaiting Approval').length})</strong>
                        </div> 
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Disapproved Posts  ({posts.filter(entry => entry.data().status === 'Not Approved').length})</strong>
                        </div> 
                        {
                            posts
                            .filter(entry => entry.data().status === 'Awaiting Approval')
                            .map(entry => {
                                const { id } = entry;

                                const {
                                    subject,
                                    body,
                                    video,
                                    author,
                                    maradminid, 
                                    notes
                                } = entry.data();

                                return (
                                    <div key={id} className='mb-4 alert alert-danger' style={{ borderRadius: 20, padding: 20 }}>
                                        <div className='mb-3'>
                                            <label>Subject</label>
                                            <div>{subject}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Body</label>
                                            <div>{body}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Video URL</label>
                                            <div>{video}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>MarAdmin ID</label>
                                            <div>{maradminid}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Author</label>
                                            <div>{author}</div>
                                        </div>
                                        <div className='mb-3'>
                                        <label>Approver Notes</label>
                                        <textarea className="form-control" rows="6" value={notes} ref={note}></textarea>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-33 round-10`}
                                            onClick={async (event) => {
                                                const docRef = doc(getFirestore(), 'posts', id);
                                                const data = {
                                                    notes: note.current.value,
                                                    status: 'Approved',
                                                    approvedBy: AppUser.name,
                                                    approvedOn: serverTimestamp(),                                                 
                                                  };
                                                  await updateDoc(docRef, data)
                                                  .then(docRef => {
                                                    toast.success('The entry has been successfully approved.', {
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
                                                  setTimeout(function(){
                                                    window.location.reload(false);
                                                 }, 2000);
                                            }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                type='button'
                                style={{marginLeft:5, marginRight:5}}
                                className='btn btn-danger w-33 btn-sm round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    const docRef = doc(getFirestore(), 'posts', id);
                                   await deleteDoc(docRef)
                                    .then(docRef => {
                                        toast.success('The entry has been successfully deleted.', {
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
                                            onClick={async (event) => {
                                                const docRef = doc(getFirestore(), 'posts', id);
                                                const data = {
                                                    notes: note.current.value,
                                                    status: 'Not Approved',
                                                    approvedBy: "",
                                                    approvedOn: ""                                              
                                                  };
                                                  await updateDoc(docRef, data)

                                                  .then(docRef => {
                                                    toast.success('The entry has been successfully disapproved.', {
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
                                                  setTimeout(function(){
                                                    window.location.reload(false);
                                                 }, 2000);
                                            }}
                                        >
                                            Disapprove
                                        </button>
                            <ToastContainer />
                                    </div>
                                )
                            })
                        }
                    </div>
                }
                                <h4 className={`text-start${posts.length !== 0 ? ' mb-4' : ' mb-0'}`}>Posts ({posts.length})</h4>

                <div className='d-flex justify-content-start filter-container'>
                <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search Posts' title='Search Posts' ref={searchField} onChange={onSearch}/>
                    </div>
                </div>
                <NewsTable posts={posts} AppUser={AppUser} searchQuery={searchQuery} />
            </div>
        </div>
    );
}

export default News;