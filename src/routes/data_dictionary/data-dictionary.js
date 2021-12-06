import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import DataDictionaryTable from './data-dictionary-table';
import { useAuth } from "../../components/provideAuth";
import './data-dictionary.css'

function DataDictionary() {
    const status = useRef();
    const group = useRef();
    const term = useRef();
    const description = useRef();
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
    const [entries, setEntries] = useState([]);
    const [formLoading, setFormLoading] = useState(true);
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();

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
        const q = query(collection(db, "dataDictionary"), orderBy('term', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });

            console.log(items);

            setEntries(items);
            setCache(items);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (searchQuery) {
            console.log('Filter Query: ', searchQuery);

            setEntries(cache.filter(entry => {
                const { term, description } = entry.data();

                return term?.toUpperCase().includes(searchQuery.toUpperCase()) || description?.toUpperCase().includes(searchQuery.toUpperCase())
            }));
        } else {
            setEntries(cache);
        }
    }, [searchQuery, cache]);

    function onSearch(event) {
        setSearchQuery(event.target.value);
    }

    function filterByGroup(group) {
        console.log('Filter by:', group);

        setEntries(cache.filter(entry => {
            return entry.data().group === group
        }));
    }

    function toggle(state) {
        if (state === true) {
            setEntries(cache);    
        }

        return state ? false : true;
    }

    function downloadCSV(param) {
        const {
            fileName,
            csv
        } = param;

        const csvString = csv;
        const universalBOM = "\uFEFF";
        const a = window.document.createElement('a');
        const today = new Date();

        a.setAttribute('href', 'data:text/csv; charset=utf-8,' + encodeURIComponent(universalBOM+csvString));
        a.setAttribute('download', `${`${fileName}-${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`}.csv`);

        window.document.body.appendChild(a);

        a.click();
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
                {
                    AppUser?.roles?.includes('Publisher') &&
                    <div className='cp-form-inner mb-5 mt-4'>
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
                            <div className='input-group mb-2'>
                                <label className='input-group-text' htmlFor='group'>Published Status</label>
                                    {
                                        AppUser?.roles?.includes('Approver') ?
                                        <select className='form-select' id='group' ref={status} >
                                            <option value='Awaiting Approval'>Submit for approval</option>
                                            <option value='Published'>Approved</option>
                                            {/* <option value='Archived'>Archived</option> */}
                                        </select> :
                                        <select className='form-select' id='group' ref={status} >
                                            <option value='Awaiting Approval'>Submit for approval</option>
                                            {/* <option value='Archived'>Archived</option> */}
                                        </select>
                                    }
                            </div>
                            {
                                AppUser?.roles ?
                                <div className='w-100 d-flex justify-content-end align-items-center mb-3'>
                                    <span>
                                        <strong>Roles: </strong>
                                    </span>
                                    <span className='ps-2'>{AppUser?.roles.sort().join(', ')}</span>
                                </div> :
                                ''
                            }
                            <button
                                type='button'
                                className='btn btn-success w-100 round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    // Create Firestore document, holds file metadata
                                    const data = {
                                        status: status.current.value,
                                        publishedBy: AppUser?.name,
                                        publishedOn: serverTimestamp(),
                                        group: group.current.value,
                                        term: term.current.value,
                                        description: description.current.value
                                    };
                                    
                                    if (status.current.value === 'Approved') {
                                        data.approvedBy = AppUser.name;
                                        data.approvedOn = serverTimestamp();
                                    }

                                    const db = getFirestore();
                                    const docRef = await addDoc(collection(db, 'dataDictionary'), data);

                                    console.log('Document written with ID: ', docRef.id);

                                    // Reset fields
                                    status.current.value = 'Awaiting Approval'
                                    group.current.value = 'None'
                                    term.current.value = '';
                                    description.current.value = '';
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                }
                {
                    AppUser?.roles?.includes('Approver') &&
                    <div className='d-flex flex-column mt-3 w-100 mb-5' style={{ maxWidth: 820}}>
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Data dictionary entries awaiting approval ({entries.filter(entry => entry.data().status === 'Awaiting Approval').length})</strong>
                        </div> 
                        {
                            entries
                            .filter(entry => entry.data().status === 'Awaiting Approval')
                            .map(entry => {
                                const { id } = entry;

                                const {
                                    term,
                                    description,
                                    group
                                } = entry.data();

                                return (
                                    <div key={id} className='mb-4 alert alert-danger' style={{ borderRadius: 20, padding: 20 }}>
                                        <div className='mb-3'>
                                            <label>Term</label>
                                            <div>{term}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Description</label>
                                            <div>{description}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Group</label>
                                            <div>{group || 'None'}</div>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-100 round-10`}
                                            onClick={event => {
                                                updateDoc(
                                                    doc(getFirestore(), 'dataDictionary', id),
                                                    {
                                                        status: 'Approved',
                                                        approvedBy: AppUser.name,
                                                        approvedOn: serverTimestamp()
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
                <h4 className='text-start mb-4 w-100' style={{maxWidth: 820}}>Data Dictionary Entries ({entries.length})</h4>
                <div className='d-flex justify-content-start filter-container'>
                    <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search data dictionary' title='search data dictionary' ref={searchField} onChange={onSearch}/>
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
                            setFilterNoGroup(false);
                            setEntries(cache);
                        }}
                    >
                        Clear
                    </button>
                </div>
                <div style={{width: 'calc(100% - 160px)'}}>
                    <button
                        type='button'
                        className='btn btn-secondary w-100 round-10 mt-4'
                        ref={uploadButton}
                        onClick={async (event) => {
                            /** Build CSV String */
                            const fields = [
                                'term',
                                'description'
                            ];
                            const headers = [
                                'Term',
                                'Description'
                            ].join(',');
                            const rows = entries.map(item => fields.map(field => `"${item.data()[field]?.replace(/(\r\n|\n|\r)/gm,"").trim()}"`).join(',')).join('\n');
                            const csv = `${headers}\n${rows}`;
                                            
                            console.log(csv);

                            downloadCSV({
                                fileName: 'data-dictionary',
                                csv
                            });
                        }}
                    >
                        Download
                    </button>
                </div>
                <DataDictionaryTable entries={entries} searchQuery={searchQuery} />
                {
                    // entries.length !== 0 &&
                    // <div className='table-container'>
                    //     <h4 className='mb-4 text-start'>Data Dictionary Entries ({entries.length})</h4>
                    //     <table className='w-100'>
                    //         <thead>
                    //             <tr>
                    //                 <th>Term</th>
                    //                 <th>Description</th>
                    //                 <th>Group</th>
                    //             </tr>
                    //         </thead>
                    //         <tbody>
                    //             {
                    //                 entries.map(item => {
                    //                     const {
                    //                         term,
                    //                         description,
                    //                         // group
                    //                     } = item.data();

                    //                     function editFaq(event) {
                    //                         console.log(event);
                    //                     }

                    //                     return(
                    //                         <tr onClick={editFaq} key={item.id}>
                    //                             <td>{term}</td>
                    //                             <td>{description}</td>
                    //                             <td></td>
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

export default DataDictionary;