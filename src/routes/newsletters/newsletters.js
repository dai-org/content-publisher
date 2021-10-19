import React, { useRef, useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import './newsletters.css'

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

function Newsletters() {
    const file = useRef();
    const title = useRef();
    const edition = useRef();
    const month = useRef();
    const year = useRef();
    const issue = useRef();
    const uploadButton = useRef();
    const [uploaded, setUploaded] = useState([]);
    const [newsletters, setNewsletters] = useState([]);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const db = getFirestore();
        // const q = query(collection(db, "newsletters"), where("state", "==", "CA"));
        const q = query(collection(db, "newsletters"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
            setNewsletters(items);
        });

        return unsubscribe;
    }, []);

    return (
        <div className='upload-container'>
            <div className='upload-wrapper'>
                <div className='upload-inner'>
                    <div>
                        <h3 className='mb-4'>Upload Newsletter (PDF)</h3>
                        <div className='input-group mb-3'>
                            <input type='file' className='form-control' id='file' ref={file} />
                        </div>
                        <hr />
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Title</span>
                            <input type='text' className='form-control' aria-label='Title' ref={title} />
                        </div>
                        <div className='input-group mb-3'>
                            <label className='input-group-text' htmlFor='edition'>Edition</label>
                            <select className='form-select' id='edition' ref={edition} >
                                <option value='Weekly'>Weekly</option>
                                <option value='Monthly'>Monthly</option>
                                <option value='Monthly'>Ad Hoc</option>
                            </select>
                        </div>
                        <div className='input-group mb-3'>
                            <label className='input-group-text' htmlFor='edition'>Month</label>
                            <select className='form-select' id='edition' ref={month} >
                                <option value='1'>January</option>
                                <option value='2'>February</option>
                                <option value='3'>March</option>
                                <option value='4'>April</option>
                                <option value='5'>May</option>
                                <option value='6'>June</option>
                                <option value='7'>July</option>
                                <option value='8'>August</option>
                                <option value='9'>September</option>
                                <option value='10'>October</option>
                                <option value='11'>November</option>
                                <option value='12'>December</option>
                            </select>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Year</span>
                            <input type='number' className='form-control' defaultValue={new Date().getFullYear()} aria-label='year' ref={year} />
                        </div>
                        <div className='input-group mb-4'>
                            <span className='input-group-text'>Issue</span>
                            <input type='number' className='form-control' defaultValue='1' aria-label='issue' ref={issue} />
                        </div>
                        <button
                            type='button'
                            className='btn btn-success w-100'
                            ref={uploadButton}
                            onClick={async (event) => {
                                // console.log(
                                //     file,
                                //     title,
                                //     edition,
                                //     month,
                                //     year,
                                //     issue
                                // );

                                // Disable while uploading, prevent second click
                                uploadButton.current.disabled = true;

                                try {
                                    // console.log(file.current.files[0]);
                                    const fileRef = file.current.files[0]
                                    const storage = getStorage();
                                    // Edition_YYYY-M_issue.ext
                                    const fileName = `${edition.current.value}_${year.current.value}-${month.current.value}_${issue.current.value}.pdf`
                                    const storageRef = ref(storage, fileName);

                                    // Upload file to Storage
                                    const uploadTask = uploadBytesResumable(storageRef, fileRef);

                                    // Show progress bar
                                    setShowProgressBar(true);

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

                                            setProgress(progress);

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
                                            // Handle successful uploads on complete

                                            // Create Firestore document, holds file metadata
                                            const db = getFirestore();
                                            const docRef = await addDoc(collection(db, 'newsletters'), {
                                                edition: edition.current.value,
                                                title: title.current.value,
                                                issue: parseInt(issue.current.value),
                                                month: parseInt(month.current.value),
                                                year: parseInt(year.current.value)
                                            });

                                            console.log('Document written with ID: ', docRef.id);

                                            // Reset fields
                                            file.current.value = '';
                                            title.current.value = '';

                                            // Hide progress bar
                                            setShowProgressBar(false);

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
                        {
                            showProgressBar &&
                            <div className='progress position-relative mt-4'>
                                <div className='progress-bar bg-success' role='progressbar' style={{ width: `${progress}%` }} aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'></div>
                                <small className='justify-content-center d-flex position-absolute w-100'>{progress}%</small>
                            </div>
                        }
                    </div>
                </div>
                {
                    newsletters.length !== 0 &&
                    <div className='table-container'>
                        <h4 className='mb-4 text-start'>Newsletters ({newsletters.length})</h4>
                        <table className='w-100'>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Issue</th>
                                    <th>Month</th>
                                    <th>Year</th>
                                    <th>Edition</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    newsletters.map(item => {
                                        const {
                                            edition,
                                            title,
                                            issue,
                                            month,
                                            year
                                        } = item.data();

                                        function openNewsletter(event) {
                                            const storage = getStorage();
                                            getDownloadURL(ref(storage, `${edition.split(' ').join('-')}_${year}-${month}_${issue}.pdf`))
                                            .then((url) => {
                                                // console.log(url);
                                                window.open(url);
                                            })
                                            .catch((error) => {
                                                // Handle any errors
                                            });
                                        }

                                        return(
                                            <tr onClick={openNewsletter} key={item.id}>
                                                <td>{title}</td>
                                                <td>{issue}</td>
                                                <td>{months[month - 1]}</td>
                                                <td>{year}</td>
                                                <td>{edition}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>
    );
}

export default Newsletters;