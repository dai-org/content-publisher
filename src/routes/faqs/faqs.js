import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore'
import './faqs.css'
import FaqsTable from './faqs-table';

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function Faqs() {
    const group = useRef();
    const question = useRef();
    const answer = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterNoGroup, setFilterNoGroup] = useState(false);
    const [filterOTL, setFilterOTL] = useState(false);
    const [filterB2R, setFilterB2R] = useState(false);
    const [filterCA, setFilterCA] = useState(false);
    const [filterP2P, setFilterP2P] = useState(false);
    const [filterDAI101, setFilterDAI101] = useState(false);
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        console.log('triggered');

        const db = getFirestore();
        const q = query(collection(db, "faq"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
            setFaqs(items);
            setCache(items);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (searchQuery) {
            console.log('Filter query: ', searchQuery);
            
            const filtered = cache.filter(entry => {
                return entry.data()?.question.toUpperCase().includes(searchQuery.toUpperCase()) ||
                    entry.data()?.answer.toUpperCase().includes(searchQuery.toUpperCase()) ||
                    entry.data()?.group.toUpperCase().includes(searchQuery.toUpperCase())
            });

            setFaqs(filtered);
        } else {
            setFaqs(cache);
        }
    }, [searchQuery, cache]);

    function onSearch(event) {
        setSearchQuery(event.target.value);
        setFilterB2R(false);
        setFilterOTL(false);
        setFilterP2P(false);
        setFilterDAI101(false);
        setFilterCA(false);
        setFilterNoGroup(false);
    }

    function filterByGroup(group) {
        console.log('Filter by:', group);

        setFaqs(cache.filter(entry => {
            return entry.data().group === group
        }));
    }

    function toggle(state) {
        if (state === true) {
            setFaqs(cache);    
        }

        return state ? false : true;
    }

    return (
        <div className='faqs-container'>
            <div className='faqs-wrapper'>
                <div className='faqs-inner'>
                    <div>
                        <h3 className='mb-4'>Create FAQ</h3>
                        <div className='input-group mb-3'>
                            <label className='input-group-text' htmlFor='group'>Group</label>
                            <select className='form-select' id='group' ref={group} >
                                <option value='None'>No Group</option>
                                <option value='CA'>CA</option>
                                <option value='B2R'>B2R</option>
                                <option value='DAI 101'>DAI 101</option>
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
                            className='btn btn-success w-100 round-10'
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
                                group.current.value = 'None'
                                question.current.value = '';
                                answer.current.value = '';
                            }}
                        >
                            Create
                        </button>
                    </div>
                </div>
                <div className='d-flex justify-content-start filter-container'>
                <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search FAQs' title='Search FAQs' ref={searchField} onChange={onSearch}/>
                    </div>
                    <button
                        className={`btn btn-secondary btn-sm ${filterNoGroup ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('No Group');
                            setFilterB2R(false);
                            setFilterOTL(false);
                            setFilterP2P(false);
                            setFilterDAI101(false);
                            setFilterCA(false);
                            setFilterNoGroup(toggle(filterNoGroup));
                        }}
                    >
                        No Group
                    </button>
                    <button
                        className={`btn btn-secondary btn-sm ${filterCA ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('CA');
                            setFilterB2R(false);
                            setFilterOTL(false);
                            setFilterP2P(false);
                            setFilterDAI101(false);
                            setFilterCA(toggle(filterCA));
                            setFilterNoGroup(false);
                        }}
                    >
                        CA
                    </button>
                    <button
                        className={`btn btn-secondary btn-sm ${filterB2R ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('B2R');
                            setFilterB2R(toggle(filterB2R));
                            setFilterOTL(false);
                            setFilterP2P(false);
                            setFilterDAI101(false);
                            setFilterCA(false);
                            setFilterNoGroup(false);
                        }}
                    >
                        B2R
                    </button>
                    <button
                        className={`btn btn-secondary btn-sm ${filterDAI101 ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('DAI 101');
                            setFilterB2R(false);
                            setFilterOTL(false);
                            setFilterP2P(false);
                            setFilterDAI101(toggle(filterDAI101));
                            setFilterCA(false);
                            setFilterNoGroup(false);
                        }}
                    >
                        DAI 101
                    </button>
                    <button
                        className={`btn btn-secondary btn-sm ${filterOTL ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('OTL');
                            setFilterB2R(false);
                            setFilterOTL(toggle(filterOTL));
                            setFilterP2P(false);
                            setFilterDAI101(false);
                            setFilterCA(false);
                            setFilterNoGroup(false);
                        }}
                    >
                        OTL
                    </button>
                    <button
                        className={`btn btn-secondary btn-sm ${filterP2P ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('P2P');
                            setFilterB2R(false);
                            setFilterOTL(false);
                            setFilterP2P(toggle(filterP2P));
                            setFilterDAI101(false);
                            setFilterCA(false);
                            setFilterNoGroup(false);
                        }}
                    >
                        P2P
                    </button>
                    <button
                        className='btn btn-primary btn-sm mr-5'
                        onClick={event => {
                            setFilterB2R(false);
                            setFilterOTL(false);
                            setFilterP2P(false);
                            setFilterDAI101(false);
                            setFilterCA(false);
                            setFilterNoGroup(false)
                            setFaqs(cache);
                        }}
                    >
                        Clear
                    </button>
                </div>
                <FaqsTable faqs={faqs} searchQuery={searchQuery} />
            </div>
        </div>
    );
}

export default Faqs;