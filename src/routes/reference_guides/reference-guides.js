import React, { useRef, useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import ReferenceGuidesTable from './reference-table';
import './reference-guides.css'

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function ReferenceGuides() {
    const file = useRef();
    const title = useRef();
    const description = useRef();
    const uploadButton = useRef();
    const searchField = useRef();
    const [searchQuery, setSearchQuery] = useState('');
    const [referenceGuides, setReferenceGuides] = useState([]);
    const [cache, setCache] = useState([]);
    // const [showProgressBar, setShowProgressBar] = useState(false);
    // const [progress, setProgress] = useState(0);
    const [uploaded, setUploaded] = useState([]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "referenceGuides"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
            setReferenceGuides(items);
            setCache(items);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (searchQuery) {
            console.log('Filter Query: ', searchQuery);

            setReferenceGuides(cache.filter(entry => {
                return entry.data()?.title.toUpperCase().includes(searchQuery.toUpperCase()) ||
                    entry.data()?.description.toUpperCase().includes(searchQuery.toUpperCase())
            }));
        } else {
            setReferenceGuides(cache);
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
                        <h3 className='mb-4'>Upload Reference Guide (PDF)</h3>
                        <div className='input-group mb-3'>
                            <input type='file' className='form-control' id='file' ref={file} />
                        </div>
                        <hr />
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Title</span>
                            <input type='text' className='form-control' aria-label='Title' ref={title} />
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Description</span>
                            <textarea className="form-control" rows="6" ref={description}></textarea>
                        </div>
                        <button
                            type='button'
                            className='btn btn-success w-100 round-10'
                            ref={uploadButton}
                            onClick={async (event) => {
                                // Disable while uploading, prevent second click
                                uploadButton.current.disabled = true;

                                try {
                                    // Create Firestore document, holds file metadata
                                    const db = getFirestore();
                                    const docRef = await addDoc(collection(db, 'newsletters'), {
                                        title: title.current.value,
                                        issue: description.current.value,
                                    });

                                    console.log('Document written with ID: ', docRef.id);

                                    // console.log(file.current.files[0]);
                                    const fileRef = file.current.files[0]
                                    const storage = getStorage();
                                    // Edition_YYYY-M_issue.ext
                                    const fileName = `${docRef.id}.pdf`
                                    const storageRef = ref(storage, fileName);

                                    // Upload file to Storage
                                    const uploadTask = uploadBytesResumable(storageRef, fileRef);

                                    // Show progress bar
                                    // setShowProgressBar(true);

                                    // Register three observers:
                                    // 1. 'state_changed' observer, called any time the state changes
                                    // 2. Error observer, called on failure
                                    // 3. Completion observer, called on successful completion
                                    uploadTask.on(
                                        'state_changed', 
                                        (snapshot) => {
                                            // Observe state change events such as progress, pause, and resume
                                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                            const progress = Math.ceil((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

                                            // setProgress(progress);

                                            console.log('Upload is ' + progress + '% done');

                                            switch (snapshot.state) {
                                                case 'paused':
                                                    console.log('Upload is paused');
                                                    break;
                                                case 'running':
                                                    console.log('Upload is running');
                                                    break;
                                                default:
                                                    console.log('Upload status is unknown.');
                                                    break;
                                            }
                                        }, 
                                        (error) => {
                                            // Handle unsuccessful uploads
                                        }, 
                                        async () => {
                                            // Reset fields
                                            file.current.value = '';
                                            title.current.value = '';

                                            // Hide progress bar
                                            // setShowProgressBar(false);

                                            // Reenable button
                                            uploadButton.current.disabled = false;

                                            // et the download URL: https://firebasestorage.googleapis.com/...
                                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                                console.log('File available at', downloadURL);

                                                // Add file to uploaded list
                                                setUploaded([{
                                                    name: fileName,
                                                    url: downloadURL,
                                                    file: fileRef
                                                }].concat(uploaded))
                                            });
                                        }
                                    );
                                } catch (event) {
                                    console.error('Error adding document: ', event);
                                }
                            }}
                        >
                            Upload
                        </button>
                        {/* {
                            showProgressBar &&
                            <div className='progress position-relative mt-4'>
                                <div className='progress-bar bg-success' role='progressbar' style={{ width: `${progress}%` }} aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'></div>
                                <small className='justify-content-center d-flex position-absolute w-100'>{progress}%</small>
                            </div>
                        } */}
                    </div>
                </div>
                <div className='d-flex justify-content-start filter-container'>
                    <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search newsletters' title='search newsletters' ref={searchField} onChange={onSearch}/>
                    </div>
                </div>
                <ReferenceGuidesTable referenceGuides={referenceGuides} searchQuery={searchQuery} />
                {
                    // referenceGuides.length !== 0 &&
                    // <div className='table-container'>
                    //     <h4 className='mb-4 text-start'>Refernce Guides ({referenceGuides.length})</h4>
                    //     <table className='w-100'>
                    //         <thead>
                    //             <tr>
                    //                 <th>Title</th>
                    //                 {/* <th>Issue</th>
                    //                 <th>Month</th>
                    //                 <th>Year</th>
                    //                 <th>Edition</th> */}
                    //             </tr>
                    //         </thead>
                    //         <tbody>
                    //             {
                    //                 referenceGuides.map(item => {
                    //                     const {
                    //                         title
                    //                     } = item.data();

                    //                     function openNewsletter(event) {
                    //                         console.log('open reference guide');
                    //                         // const storage = getStorage();
                    //                         // getDownloadURL(ref(storage, `${edition.split(' ').join('-')}_${year}-${month}_${issue}.pdf`))
                    //                         // .then((url) => {
                    //                         //     // console.log(url);
                    //                         //     window.open(url);
                    //                         // })
                    //                         // .catch((error) => {
                    //                         //     // Handle any errors
                    //                         // });
                    //                     }

                    //                     return(
                    //                         <tr onClick={openNewsletter} key={item.id}>
                    //                             <td>{title}</td>
                    //                             {/* <td>{issue}</td>
                    //                             <td>{months[month - 1]}</td>
                    //                             <td>{year}</td>
                    //                             <td>{edition}</td> */}
                    //                         </tr>
                    //                     )
                    //                 })
                    //             }
                    //         </tbody>
                    //     </table>
                    // </div>
                }
            </div>
        </div>
    );
}

export default ReferenceGuides;