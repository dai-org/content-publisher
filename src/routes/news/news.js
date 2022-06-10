import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import './news.css'
import NewsTable from './news-table';
import { useAuth } from "../../components/provideAuth";

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function News() {
    const subject = useRef();
    const postType = useRef();
    const body = useRef();
    const video = useRef();
    const author = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const status = useRef();
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
    const [formLoading, setFormLoading] = useState(true);

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
        const q = query(collection(db, 'posts'));
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
                <div className='cp-form-inner mb-5 mt-4'>
                    <div>
                        <h3 className='mb-4'>New Post</h3>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Subject</span>
                            <textarea className="form-control" rows="1" ref={subject}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Body</span>
                            <textarea className="form-control" rows="6" ref={body}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Video URL</span>
                            <textarea className="form-control" rows="1" ref={video}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Author</span>
                            <textarea value={AppUser.name} className="form-control" rows="1" ref={author}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Post Type</span>
                            <select onChange={{}} className='form-select' id='status' ref={postType} >
                                    <option value='general'>Select An Option</option>
                                    <option value='alert'>Alert</option>
                                    <option value='info'>Information Only</option>
                                    <option value='general'>General</option>
                                </select>
                        </div>
                        <div className='input-group mb-2'>
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
                                // Create Firestore document, holds file metadata
                                const db = getFirestore();
                                const data = {
                                    subject: subject.current.value,
                                    body: body.current.value,
                                    video: video.current.value,
                                    author: author.current.value,
                                    date: serverTimestamp(),
                                    publishedBy: AppUser?.name,
                                    publishedOn: serverTimestamp(), 
                                    status: status.current.value,
                                    type: postType.current.value

                                };

                                if (status.current.value === 'Approved') {
                                    data.approvedBy = AppUser.name;
                                    data.approvedOn = serverTimestamp();
                                    data.status = 'Approved';
                                }
                                const docRef = await addDoc(collection(db, 'posts'), data);
                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                postType.current.value = '';
                                subject.current.value = '';
                                body.current.value = '';
                                video.current.value = '';
                                author.current.value = '';
                                status.current.value = 'Awaiting Approval';
                            }}
                        >
                            Post
                        </button>
                    </div>
                </div>

                {
                    AppUser?.roles?.includes('Approver') &&
                    <div className='d-flex flex-column mt-3 w-100 mb-5' style={{ maxWidth: 820}}>
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Posts awaiting approval ({posts.filter(entry => entry.data().status === 'Awaiting Approval').length})</strong>
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
                                    postType, 
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
                                            <label>Author</label>
                                            <div>{author}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Post Type</label>
                                            <div>{postType}</div>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-100 round-10`}
                                            onClick={event => {
                                                updateDoc(
                                                    doc(getFirestore(), 'posts', id),
                                                    {
                                                        status: 'Approved',
                                                        approvedBy: AppUser.name,
                                                        approvedOn: serverTimestamp(),
                                                    }
                                                );
                                            }}
                                        >
                                            Approve
                                        </button>
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
                <NewsTable posts={posts} searchQuery={searchQuery} />
            </div>
        </div>
    );
}

export default News;