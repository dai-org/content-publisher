import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { deleteDoc, getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, where, updateDoc, doc, orderBy } from 'firebase/firestore'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from "../../components/provideAuth";
import NewslettersTable from './newsletters-table';
import './newsletters.css'
import {sendEmailApprover} from '../../admin/index';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    const status = useRef();
    const file = useRef();
    const title = useRef();
    const edition = useRef();
    const month = useRef();
    const year = useRef();
    const issue = useRef();
    const uploadButton = useRef();
    const searchField = useRef();
    const [searchQuery, setSearchQuery] = useState('');
    const [adHocFilter, setAdHocFilter] = useState(false);
    const [monthlyFilter, setMonthlyFilter] = useState(false);
    const [weeklyFilter, setWeeklyFilter] = useState(false);
    const [uploaded, setUploaded] = useState([]);
    const [cache, setCache] = useState([]);
    const [newsletters, setNewsletters] = useState([]);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [progress, setProgress] = useState(0);
    const [formLoading, setFormLoading] = useState(true);
    const [AppUser, setAppUser] = useState([]);
    const auth = useAuth();
    const note = useRef();
    const [adminEmail, setadminEmail] = useState('');

    useEffect(() => {
        if (auth.user.email) {
            const db = getFirestore();
            const q = query(collection(db, "appDistro"), where('roles', '==', 'NewsLetterPublisher'));
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

                console.log(items[0].data());

                setFormLoading(false);
                setAppUser(items[0].data());
            });

            return unsubscribe;
        }
    }, [auth]);

    useEffect(() => {
        const db = getFirestore();
        // const q = query(collection(db, "newsletters"), where("state", "==", "CA"));
        const q = query(collection(db, "newsletters"), orderBy('status', 'desc') );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let items = [];

            querySnapshot.forEach((doc) => {
                items.push(doc);
            });

            items = items.sort((a, b) => {
                return b.data().month - a.data().month || b.data().issue - a.data().issue;
            });

            setCache(items);
            setNewsletters(items);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (searchQuery) {
            console.log('Filter Query: ', searchQuery);

            setNewsletters(cache.filter(entry => {
                const month = months[entry.data().month - 1];

                console.log(month);

                return entry.data()?.title.toUpperCase().includes(searchQuery.toUpperCase()) ||
                    entry.data()?.edition.toUpperCase().includes(searchQuery.toUpperCase()) ||
                    entry.data()?.issue.toString().toUpperCase().includes(searchQuery.toUpperCase()) ||
                    entry.data()?.month.toString().toUpperCase().includes(searchQuery.toUpperCase()) ||
                    entry.data()?.year.toString().toUpperCase().includes(searchQuery.toUpperCase()) ||
                    month?.toUpperCase().includes(searchQuery.toUpperCase())
            }));
        } else {
            setNewsletters(cache);
        }
        
    }, [searchQuery, cache]);

    function onSearch(event) {
        setSearchQuery(event.target.value);
    }

    function filterByGroup(edition) {
        console.log('Filter by:', edition);

        setNewsletters(cache.filter(entry => {
            return entry.data().edition === edition
        }));
    }

    function toggle(state) {
        if (state === true) {
            setNewsletters(cache);    
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
                 { AppUser?.roles?.includes('Publisher') ?
                    <div className='cp-form-inner mb-5 mt-4'>
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
                                    <option value='Ad Hoc'>Ad Hoc</option>
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
                                <input type='number' className='form-control' placeholder={new Date().getFullYear()} aria-label='year' ref={year} />
                            </div>
                            <div className='input-group mb-4'>
                                <span className='input-group-text'>Issue</span>
                                <input type='number' className='form-control' placeholder='1' aria-label='issue' ref={issue} />
                            </div>
                            <div className='input-group mb-2'>
                                <label className='input-group-text' htmlFor='group'>Published Status</label>
                                {
                                    AppUser?.roles?.includes('NewsletterPublisher') ?
                                    <select className='form-select' id='group' ref={status} >
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
                                                // Create Firestore document, holds file metadata
                                                const data = {
                                                    status: status.current.value,
                                                    publishedBy: AppUser?.name,
                                                    publishedOn: serverTimestamp(),
                                                    edition: edition.current.value,
                                                    title: title.current.value,
                                                    issue: parseInt(issue.current.value),
                                                    month: parseInt(month.current.value),
                                                    year: parseInt(year.current.value),
                                                    created: serverTimestamp()
                                                };

                                                if (status.current.value === 'Approved') {
                                                    data.approvedBy = AppUser.name;
                                                    data.approvedOn = serverTimestamp();
                                                    data.status = 'Approved';
                                                }else{
                                                    sendEmailApprover(adminEmail, "New Newsletter Entry");
                                                }

                                                const db = getFirestore();
                                                const docRef = await addDoc(collection(db, 'newsletters'), data);

                                                console.log('Document written with ID: ', docRef.id);

                                                // Reset fields
                                                status.current.value = 'Awaiting Approval'
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
                 : ""}
                {
                    AppUser?.roles?.includes('NewsletterPublisher') &&
                    <div className='d-flex flex-column mt-3 w-100 mb-5' style={{ maxWidth: 820}}>
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Newsletters awaiting approval ({newsletters.filter(entry => entry.data().status === 'Awaiting Approval').length})</strong>
                        </div> 
                        <div className='alert alert-info w-100' style={{ borderRadius: 20 }}>
                            <strong>Disapproved Newsletters  ({newsletters.filter(entry => entry.data().status === 'Not Approved').length})</strong>
                        </div> 
                        {
                            newsletters
                            .filter(entry => entry.data().status === 'Awaiting Approval')
                            .map(entry => {
                                const { id } = entry;

                                const {
                                    edition,
                                    title,
                                    issue,
                                    month,
                                    year, 
                                } = entry.data();

                                return (
                                    <div key={id} className='mb-4 alert alert-danger' style={{ borderRadius: 20, padding: 20 }}>
                                        <div className='mb-3'>
                                            <label>Edition</label>
                                            <div>{edition}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Title</label>
                                            <div>{title}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Issue</label>
                                            <div>{issue}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Month</label>
                                            <div>{month}</div>
                                        </div>
                                        <div className='mb-3'>
                                            <label>Year</label>
                                            <div>{year}</div>
                                        </div>
                                         <div className='mb-3'>
                                        <label>Approver Notes</label>
                                        <textarea className="form-control" rows="6" ref={note}></textarea>
                                        </div>
                                        <button
                                            className={`btn btn-success btn-sm w-75 round-10`}
                                            onClick={async (event) => {
                                                const docRef = doc(getFirestore(), 'newsletters', id);
                                                const data = {
                                                    notes: note.current.value,
                                                    status: 'Approved',
                                                    approvedBy: AppUser.name,
                                                    approvedOn: serverTimestamp(),
                                                };
                                                await updateDoc(docRef, data)
                                                .then(docRef => {
                                                    toast.success('The entry has been successfully approved.', {
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
                                                        });
                                                  })
                                                  setTimeout(function(){
                                                    window.location.reload(false);
                                                 }, 2000);
                                            }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                type='button'
                                style={{marginLeft:5, marginRight:5}}
                                className='btn btn-danger w-20 btn-sm round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    const docRef = doc(getFirestore(), 'newsletters', id);
                                   await deleteDoc(docRef)
                                    .then(docRef => {
                                        toast.success('The entry has been successfully deleted.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });                                    })
                                      .catch(error => {
                                        toast.error('An error has occured, Please try again.\n\n'+error, {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });
                                                                              })
                                }}
                            >
                                Delete
                            </button>
                            <button
                                            className={`btn btn-warning btn-sm w-33 round-10`}
                                            onClick={async (event) => {
                                                const docRef = doc(getFirestore(), 'newsletters', id);
                                                const data = {
                                                    notes: note.current.value,
                                                    status: 'Not Approved',
                                                    approvedBy: "",
                                                    approvedOn: ""
                                                };
                                                await updateDoc(docRef, data)
                                                .then(docRef => {
                                                    toast.success('The entry has been successfully disapproved.', {
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
                                                        });
                                                  })
                                                  setTimeout(function(){
                                                    window.location.reload(false);
                                                 }, 2000);
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
                <h4 className={`text-start${newsletters.length !== 0 ? ' mb-4' : ' mb-0'}`}>Newsletters ({newsletters.length})</h4>
                <div className='d-flex justify-content-start filter-container'>
                    <div className='search-container'>
                        <FontAwesomeIcon icon={faSearch} className='search-icon' />
                        <input type='search' placeholder='Search newsletters' title='search newsletters' ref={searchField} onChange={onSearch}/>
                    </div>
                    <button
                        className={`btn btn-secondary btn-sm ${adHocFilter ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('Ad Hoc');
                            setAdHocFilter(toggle(adHocFilter));
                            setMonthlyFilter(false);
                            setWeeklyFilter(false);
                        }}
                    >
                        Ad Hoc
                    </button>
                    <button
                        className={`btn btn-secondary btn-sm ${monthlyFilter ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('Monthly');
                            setAdHocFilter(false);
                            setMonthlyFilter(toggle(monthlyFilter));
                            setWeeklyFilter(false);
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        className={`btn btn-secondary btn-sm ${weeklyFilter ? 'selected' : ''}`}
                        onClick={event => {
                            filterByGroup('Weekly');
                            setAdHocFilter(false);
                            setMonthlyFilter(false);
                            setWeeklyFilter(toggle(weeklyFilter));
                        }}
                    >
                        Weekly
                    </button>
                    <button
                        className='btn btn-primary btn-sm mr-5'
                        onClick={event => {
                            setAdHocFilter(false);
                            setMonthlyFilter(false);
                            setWeeklyFilter(false)
                            setNewsletters(cache);
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

                            async function openNewsletter(item) {
                                const {
                                    edition,
                                    issue,
                                    month,
                                    year
                                } = item.data();

                                try {
                                    const storage = getStorage();
                                    const getUrl = await getDownloadURL(ref(storage, `${edition}_${year}-${month}_${issue}.pdf`));
    
                                    console.log(getUrl);
                                    
                                    return getUrl;
                                } catch (error) {
                                    return 'None';
                                }
                            }

                            const items = await Promise.all(newsletters.map(async item => {
                                const {
                                    title,
                                    edition,
                                    issue,
                                    month,
                                    year
                                } = item.data();

                                const url = await openNewsletter(item);

                                return {
                                    issue: issue || '',
                                    title: title || '',
                                    longMonth: months[month - 1] || '',
                                    year: year || '',
                                    edition: edition || '',
                                    url: url || ''
                                }
                            }));

                            /** Build CSV String */
                            const fields = [
                                'title',
                                'issue',
                                'longMonth',
                                'year',
                                'edition',
                                'url'
                            ];
                            const headers = [
                                'Title',
                                'Issue',
                                'Month',
                                'Year',
                                'Edition',
                                'URL'
                            ].join(',');
                            const rows = items.map(item => fields.map(field => {
                                console.log(item, field, item[field]);
                                return `"${item[field]}"`;
                            }).join(',')).join('\n');
                            const csv = `${headers}\n${rows}`;
                                            
                            console.log(csv);

                            downloadCSV({
                                fileName: 'newsletters',
                                csv
                            });
                        }}
                    >
                        Download
                    </button>
                </div>
                <NewslettersTable AppUser={AppUser} newsletters={newsletters} searchQuery={searchQuery} />
            </div>
        </div>
    );
}

export default Newsletters;