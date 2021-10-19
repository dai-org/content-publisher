import React, { useRef, useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore'
import './faqs.css'

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function Faqs() {
    const group = useRef();
    const question = useRef();
    const answer = useRef();
    const uploadButton = useRef();
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "faq"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
            setFaqs(items);
        });

        return unsubscribe;
    }, []);

    return (
        <div className='faqs-container'>
            <div className='faqs-wrapper'>
                <div className='faqs-inner'>
                    <div>
                        <h3 className='mb-4'>Create FAQ</h3>
                        <div className='input-group mb-3'>
                            <label className='input-group-text' htmlFor='group'>Group</label>
                            <select className='form-select' id='group' ref={group} >
                                <option value='CA'>CA</option>
                                <option value='DAI 101'>DAI 101</option>
                                <option value='B2R'>B2R</option>
                                <option value='OTL'>OTL</option>
                                <option value='P2P'>P2P</option>
                            </select>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Question</span>
                            <textarea className="form-control" rows="2" ref={question}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Answer</span>
                            <textarea className="form-control" rows="6" ref={answer}></textarea>
                        </div>
                        <button
                            type='button'
                            className='btn btn-success w-100'
                            ref={uploadButton}
                            onClick={async (event) => {
                                // Create Firestore document, holds file metadata
                                const db = getFirestore();
                                const docRef = await addDoc(collection(db, 'faq'), {
                                    group: group.current.value,
                                    question: question.current.value,
                                    answer: answer.current.value
                                });

                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                group.current.value = 'CA'
                                question.current.value = '';
                                answer.current.value = '';
                            }}
                        >
                            Create
                        </button>
                    </div>
                </div>
                {
                    faqs.length !== 0 &&
                    <div className='table-container'>
                        <h4 className='mb-4 text-start'>FAQs ({faqs.length})</h4>
                        <table className='w-100'>
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Answer</th>
                                    <th>Group</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    faqs.map(item => {
                                        const {
                                            question,
                                            answer,
                                            group
                                        } = item.data();

                                        function editFaq(event) {
                                            console.log(event);
                                        }

                                        return(
                                            <tr onClick={editFaq} key={item.id}>
                                                <td>{question}</td>
                                                <td>{answer}</td>
                                                <td>{group}</td>
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

export default Faqs;