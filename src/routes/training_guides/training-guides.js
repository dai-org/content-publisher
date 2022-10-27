import React, { useRef, useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore'
import './training-guides.css'

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function TrainingGuides() {
    const file = useRef();
    const title = useRef();
    const description = useRef();
    const uploadButton = useRef();
    const [trainingGuides, setTrainingGuides] = useState([]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "training"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
            setTrainingGuides(items);
        });

        return unsubscribe;
    }, []);

    return (
        <div className='cp-form-container'>
            <div className='cp-form-wrapper'>
                <div className='cp-form-inner mb-5 mt-4'>
                    <div>
                        <h3 className='mb-4'>Upload Training Guide</h3>
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
                                // Create Firestore document, holds file metadata
                                const db = getFirestore();
                                const docRef = await addDoc(collection(db, 'training'), {
                                    title: title.current.value,
                                    description: description.current.value
                                });

                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                title.current.value = '';
                                description.current.value = '';
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
                {
                    trainingGuides.length !== 0 &&
                    <div className='table-container'>
                        <h4 className='mb-4 text-start'>Training Guides ({trainingGuides.length})</h4>
                        <table className='w-100'>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    {/* <th>Issue</th>
                                    <th>Month</th>
                                    <th>Year</th>
                                    <th>Edition</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    trainingGuides.map(item => {
                                        const {
                                            title,
                                            description
                                        } = item.data();

                                        function openNewsletter(event) {
                                            console.log('open training guide');
                                            // const storage = getStorage();
                                            // getDownloadURL(ref(storage, `${edition.split(' ').join('-')}_${year}-${month}_${issue}.pdf`))
                                            // .then((url) => {
                                            //     // console.log(url);
                                            //     window.open(url);
                                            // })
                                            // .catch((error) => {
                                            //     // Handle any errors
                                            // });
                                        }

                                        return(
                                            <tr onClick={openNewsletter} key={item.id}>
                                                <td>{title}</td>
                                                <td>{description}</td>
                                                {/* <td>{issue}</td>
                                                <td>{months[month - 1]}</td>
                                                <td>{year}</td>
                                                <td>{edition}</td> */}
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

export default TrainingGuides;