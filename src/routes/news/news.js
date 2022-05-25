import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore'
import './news.css'
import NewsTable from './news-table';

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function News() {
    const subject = useRef();
    const body = useRef();
    const video = useRef();
    const author = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);

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
                            <textarea className="form-control" rows="1" ref={author}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Post Type</span>
                            <select onChange={{}} className='form-select' id='status'>
                                    <option value='general'>Select An Option</option>
                                    <option value='alert'>Alert</option>
                                    <option value='info'>Information Only</option>
                                    <option value='general'>General</option>
                                </select>
                        </div>
                        <button
                            type='button'
                            className='btn btn-success w-100 round-10'
                            ref={uploadButton}
                            onClick={async (event) => {
                                console.log(serverTimestamp());
                                
                                // Create Firestore document, holds file metadata
                                const db = getFirestore();
                                const docRef = await addDoc(collection(db, 'posts'), {
                                    subject: subject.current.value,
                                    body: body.current.value,
                                    video: video.current.value,
                                    author: author.current.value,
                                    date: serverTimestamp()
                                });

                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                subject.current.value = '';
                                body.current.value = '';
                                video.current.value = '';
                                author.current.value = '';
                            }}
                        >
                            Post
                        </button>
                    </div>
                </div>
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