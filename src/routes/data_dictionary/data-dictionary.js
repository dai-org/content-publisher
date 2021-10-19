import React, { useRef, useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore'
import './data-dictionary.css'

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function DataDictionary() {
    const group = useRef();
    const term = useRef();
    const description = useRef();
    const uploadButton = useRef();
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "dataDictionary"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });

            console.log(items);

            setEntries(items);
        });

        return unsubscribe;
    }, []);

    return (
        <div className='data-dictionary-container'>
            <div className='data-dictionary-wrapper'>
                <div className='data-dictionary-inner'>
                    <div>
                        <h3 className='mb-4'>Add Data Dictionary Entry</h3>
                        <div className='input-group mb-3'>
                            <label className='input-group-text' htmlFor='group'>Group</label>
                            <select className='form-select' id='group' ref={group} >
                                <option value='None'>No Group</option>
                                <option value='CA'>CA</option>
                                <option value='DAI 101'>DAI 101</option>
                                <option value='B2R'>B2R</option>
                                <option value='OTL'>OTL</option>
                                <option value='P2P'>P2P</option>
                            </select>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Term</span>
                            <textarea className="form-control" rows="2" ref={term}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Description</span>
                            <textarea className="form-control" rows="6" ref={description}></textarea>
                        </div>
                        <button
                            type='button'
                            className='btn btn-success w-100'
                            ref={uploadButton}
                            onClick={async (event) => {
                                // Create Firestore document, holds file metadata
                                const db = getFirestore();
                                const docRef = await addDoc(collection(db, 'dataDictionary'), {
                                    group: group.current.value,
                                    term: term.current.value,
                                    description: description.current.value
                                });

                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                group.current.value = 'None'
                                term.current.value = '';
                                description.current.value = '';
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>
                {
                    entries.length !== 0 &&
                    <div className='table-container'>
                        <h4 className='mb-4 text-start'>Data Dictionary Entries ({entries.length})</h4>
                        <table className='w-100'>
                            <thead>
                                <tr>
                                    <th>Term</th>
                                    <th>Description</th>
                                    <th>Group</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    entries.map(item => {
                                        const {
                                            term,
                                            description,
                                            // group
                                        } = item.data();

                                        function editFaq(event) {
                                            console.log(event);
                                        }

                                        return(
                                            <tr onClick={editFaq} key={item.id}>
                                                <td>{term}</td>
                                                <td>{description}</td>
                                                <td></td>
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

export default DataDictionary;