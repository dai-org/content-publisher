import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { deleteDoc, getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import DataDictionaryTable from './data-dictionary-table';
import { useAuth } from "../../components/provideAuth";
import './data-dictionary.css'
import {sendEmailApprover} from '../../admin/index';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function DataDictionary() {
    const status = useRef();
    const term = useRef();
    const description = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [entries, setEntries] = useState([]);
    const [formLoading, setFormLoading] = useState(true);
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
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
                setFormLoading(false);
                setAppUser(items[0].data());
            });

            return unsubscribe;
        }
    }, [auth]);

    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "dataDictionary"), orderBy('status', 'desc'), orderBy('term', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc);
            });
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
                 { AppUser?.roles?.includes('Publisher') ?
                    <div className='cp-form-inner mb-5 mt-4'>
                        <div>
                            <h3 className='mb-4'>Add Data Dictionary Entry</h3>
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
                                        <select className='form-select' id='group' ref={status} >
                                        <option value='Awaiting Approval'>Submit for approval</option>
                                        </select> 
                            </div>
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
                                        term: term.current.value,
                                        description: description.current.value,
                                    };
                                    
                                    if (status.current.value === 'Approved') {
                                        data.approvedBy = AppUser.name;
                                        data.approvedOn = serverTimestamp();
                                        data.status = "Approved";
                                    }else{
                                        sendEmailApprover(adminEmail, "New Data Dictionary Entry");
                                    }

                                    const docRef = await addDoc(collection(getFirestore(), 'dataDictionary'), data);
                                    console.log('Document written with ID: ', docRef.id);
                                    // Reset fields
                                    status.current.value = 'Awaiting Approval'
                                    term.current.value = '';
                                    description.current.value = '';
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                : "" }
                
                {
                    AppUser?.roles?.includes('Approver') &&
                    <div className='d-flex flex-column mt-3 w-100 mb-5' style={{ maxWidth: 820}}>
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Data dictionary entries awaiting approval ({entries.filter(entry => entry.data().status === 'Awaiting Approval').length})</strong>
                        </div> 
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Disapproved Data dictionary entries  ({entries.filter(entry => entry.data().status === 'Not Approved').length})</strong>
                        </div> 
                        {
                            entries
                            .filter(entry => entry.data().status === 'Awaiting Approval')
                            .map(entry => {
                                const { id } = entry;

                                const {
                                    term,
                                    description,
                                    notes
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
                                        <label>Approver Notes</label>
                                        <textarea className="form-control" rows="6" value={notes} ref={note}></textarea>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-33 round-10`}
                                            onClick={async (event) => {
                                                await updateDoc(doc(getFirestore(), 'dataDictionary', id),
                                                    {
                                                        notes: note.current.value,
                                                        status: 'Approved',
                                                        approvedBy: AppUser.name,
                                                        approvedOn: serverTimestamp()

                                                    }
                                                );
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
                                    const docRef = doc(getFirestore(), 'dataDictionary', id);
                                    deleteDoc(docRef)
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
                                            });                                      })
                                }}
                            >
                                Delete
                            </button>
                            <button
                                            className={`btn btn-warning btn-sm w-33 round-10`}
                                            onClick={async (event) => {
                                               await updateDoc(doc(getFirestore(), 'dataDictionary', id), {
                                                        notes: note.current.value,
                                                        status: 'Not Approved',
                                                        approvedBy: "",
                                                        approvedOn: ""

                                                    }
                                                );
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
                <h4 className='text-start mb-4 w-100' style={{maxWidth: 820}}>Data Dictionary Entries ({entries.length})</h4>
                <div className='d-flex justify-content-start filter-container'>
                    <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search data dictionary' title='search data dictionary' ref={searchField} onChange={onSearch}/>
                    </div>
                   
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
                <DataDictionaryTable entries={entries} AppUser={AppUser} searchQuery={searchQuery} />
            </div>
        </div>
    );
}

export default DataDictionary;