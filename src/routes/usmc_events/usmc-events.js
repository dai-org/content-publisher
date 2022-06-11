import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, where, doc, updateDoc } from 'firebase/firestore'
import './usmc-events.css'
import USMCEventsTable from './usmc-events-table';
import { useAuth } from "../../components/provideAuth";

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function USMCEvents() {
    const subject = useRef();
    const description = useRef();
    const timefrom = useRef();
    const timeto = useRef();
    const date = useRef();
    const searchField = useRef();
    const uploadButton = useRef();
    const [cache, setCache] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
    const [formLoading, setFormLoading] = useState(true);
    const status = useRef();

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
        const q = query(collection(db, 'events'));
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
                    entry.data()?.description?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.timefrom?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.timeto?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.status?.toUpperCase().includes(queryUpperCase) ||
                    entry.data()?.date?.toUpperCase().toLocaleString()?.toUpperCase().includes(queryUpperCase)
            });

            setPosts(filtered);
        } else {
            setPosts(cache);
        }
    }, [searchQuery, cache]);

    function onSearch(event) {
        setSearchQuery(event.target.value);
    }

    function convertTime12To24(time) {
        if ((time.includes("PM")) || (time.includes("AM"))){
        var hours   = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM    = time.match(/\s(.*)$/)[1];
        if (AMPM === "PM" && hours < 12) hours = hours + 12;
        if (AMPM === "AM" && hours === 12) hours = hours - 12;
        var sHours   = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return (sHours + "" + sMinutes);
    }
    return time;
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
                        <h3 className='mb-4'>New DAI Calendar Event</h3>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Event</span>
                            <input className="form-control" ref={subject}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Description</span>
                            <textarea className="form-control" rows="6" ref={description}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Time From</span>
                            <input type="time" className="form-control" ref={timefrom}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Time To</span>
                            <input type="time" className="form-control" ref={timeto}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'>Date</span>
                            <input type="date" data-provide="datepicker" className="form-control" placeholder='2022-05-01 YYYY-MM-DD' ref={date}></input>
                        </div>
                        <div className='input-group mb-3'>
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
                                    description: description.current.value,
                                    date: date.current.value,
                                    timefrom: convertTime12To24(timefrom.current.value),
                                    timeto: convertTime12To24(timeto.current.value),
                                    status: status.current.value,
                                    publishedOn:serverTimestamp(),
                                    publishedBy:AppUser.name,
                                };

                                if (status.current.value === 'Approved') {
                                    data.approvedBy = AppUser.name;
                                    data.approvedOn = serverTimestamp();
                                    data.status = 'Approved';
                                }

                                const docRef = await addDoc(collection(db, 'events'), data);

                                console.log('Document written with ID: ', docRef.id);

                                // Reset fields
                                subject.current.value = '';
                                description.current.value = '';
                                date.current.value = '';
                                timefrom.current.value = '';
                                timeto.current.value = '';
                                status.current.value = 'Awaiting Approval';
                            }}
                        >
                            Post
                        </button>
                    </div>
                </div> 
                : ""
            }

{
                    AppUser?.roles?.includes('Approver') &&
                    <div className='d-flex flex-column mt-3 w-100 mb-5' style={{ maxWidth: 820}}>
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Calendar events awaiting approval ({posts.filter(entry => entry.data().status === 'Awaiting Approval').length})</strong>
                        </div> 
                        {
                            posts
                            .filter(entry => entry.data().status === 'Awaiting Approval')
                            .map(entry => {
                                const { id } = entry;

                                const {
                                    subject,
                                    description,
                                    timefrom,
                                    timeto,
                                    date,
                                } = entry.data();

                                return (
                                    <div key={id} className='mb-4 alert alert-danger' style={{ borderRadius: 20, padding: 20 }}>
                                        <div className='mb-3'>
                                            <label>Event</label>
                                            <div>{subject}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Description</label>
                                            <div>{description}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Time From</label>
                                            <div>{timefrom}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Time To</label>
                                            <div>{timeto}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Date</label>
                                            <div>{date}</div>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-100 round-10`}
                                            onClick={event => {
                                                updateDoc(
                                                    doc(getFirestore(), 'events', id),
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

                <div className='d-flex justify-content-start filter-container'>
                <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search Posts' title='Search Posts' ref={searchField} onChange={onSearch}/>
                    </div>
                </div>
                <USMCEventsTable posts={posts} searchQuery={searchQuery} />

            </div>
        </div>
    );
}

export default USMCEvents;