import { getStorage, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import Cell from '../../components/cell';
import { faFilePdf, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFirestore, updateDoc, doc, deleteDoc, serverTimestamp} from 'firebase/firestore'
import React, { useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]
import Modali, { useModali } from 'modali';

const months = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12'
];

function NewslettersTable(props) {
    const { newsletters, searchQuery, AppUser } = props;
    const db = getFirestore();
    const storage = getStorage();
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const uploadButton = useRef();
    const notes = useRef();
    const approved = useRef();
    const title = useRef();
    const edition = useRef();
    const month = useRef();
    const year = useRef();
    const issue = useRef();
    const status = useRef();


    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit Newsletters"
      });
    return (
        <div className='table-container'>
            {
                newsletters.length !== 0 &&
                <table className='w-100'>
                   <Modali.Modal {...exampleModal}>
                { 
                AppUser?.roles?.includes('Publisher') || AppUser?.roles?.includes('NewsletterPublisher')  ?
                <div className='cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center'>
                <div>
                    <div className='input-group mb-3'>
                        <span className='input-group-text'>Title</span>
                        <input type='text' className='form-control' defaultValue={editData.title} aria-label='Title' ref={title} />
                    </div>
                    
                    <div className='input-group mb-3'>
                                    <span className='input-group-text'>Notes</span>
                                    <textarea className="form-control" defaultValue={editData.notes} rows="6"  ref={notes}></textarea>
                                </div>
                                <div className='input-group mb-3'>
                                    <span className='input-group-text'>Info: If the Month, Edition, Year or issue need to be changed, a new, newsletter will need to be published and the old one deleted. </span>
                                </div>

                    <div className='input-group mb-2'>
                        { editData.status !== "Approved" ?
                                <div className='input-group mb-2'>
                                <label className='input-group-text' htmlFor='group'>Published Status</label>
                                        <select className='form-select' id='group' ref={status} >
                                        <option value='Awaiting Approval'>Submit for approval</option>
                                        </select> 
                            </div>
                                    : ""}
                 </div>

                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    const docRef = doc(db, 'newsletters', idData);
                                    const data = {
                                        title: title.current.value,
                                        notes: notes.current.value,
                                        status: (editData.status !== "Approved") ? approved.current.value : "Approved"

                                    };
                                     await updateDoc(docRef, data)
                                      .then(docRef => {
                                        toast.success('The entry has been successfully updated.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });                                     })
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
                                Update
                            </button>

                            <button
                                type='button'
                                style={{marginLeft:5}}
                                className='btn btn-danger w-20 round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                        if (AppUser?.roles?.includes('Publisher') || AppUser?.roles?.includes('NewsletterPublisher')){
                                        if (window.confirm("Are you sure you want to delete this Newsletter.")){
                                            const docRef = doc(db, 'newsletters', idData);
                                           await deleteDoc(docRef)
                                            .then(docRef => {
                                                const desertRef = ref(storage, `${editData.edition}_${editData.year}-${editData.month}_${editData.issue}.pdf`)
                                                deleteObject(desertRef).then(() => {
                                                    // File deleted successfully
                                                  }).catch((error) => {
                                                    // Uh-oh, an error occurred!
                                                  });
                                                  toast.success('The entry has been successfully deleted.', {
                                                    position: "top-center",
                                                    autoClose: 5000,
                                                    hideProgressBar: true,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: false,
                                                    progress: 0,
                                                    });                                        })
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
                                     }
                                    }else{
                                        toast.error('This account does not have permisions to delete this newsletter.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });
                                    }
                                }
                            }
                            >
                                Delete
                            </button>
                            <ToastContainer />
                    </div></div>
                    :
                    
<div class="alert">
  <h4 class="alert-heading">Access Denied!</h4>
  <p>Current user does not have access to edit data.</p>
</div>
}
                                        </Modali.Modal>  
                    <thead>
                        <tr>
                        <th width='15%'></th>
                            <th width='25%'>Title</th>
                            <th width='25%'>File Name</th>
                            <th width='20%'>Published</th> 
                            <th width='20%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            newsletters.map(item => {
                                const { id } = item;

                                const {
                                    edition,
                                    title,
                                    issue,
                                    month,
                                    year,
                                    publishedBy,
                                    publishedOn,
                                    approvedBy,
                                    status,
                                    approvedOn
                                } = item.data();

         
                                function openNewsletter(event) {
                                    // getDownloadURL(ref(storage, `${edition.split(' ').join('-')}_${year}-${month}_${issue}.pdf`))
                                    getDownloadURL(ref(storage, `${edition}_${year}-${month}_${issue}.pdf`))
                                    .then((url) => {
                                        // console.log(url);
                                        window.open(url);
                                    })
                                    .catch((error) => {
                                        // Handle any errors
                                    });
                                }

                                function openEdits(event) {
                                        setIDData(id)
                                     setEditData(item.data())
                                     toggleExampleModal() 
                                 }
                                 
                                return(
                                    <tr bgcolor={status !== "Approved" ? "#ffffe0" : ""}>
                                        <td>
                                       { 
                                       AppUser?.roles?.includes('Publisher') || AppUser?.roles?.includes('NewsletterPublisher')  ?
                                        <FontAwesomeIcon style={{marginRight: 15}} onClick={openEdits} color="red" icon={faEdit}/> : ""
                                }

                                        <FontAwesomeIcon onClick={openNewsletter} icon={faFilePdf}/>
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={title} />
                                        </td>
                                        <td>
                                            <Cell  words={[searchQuery]} text={ edition +'-'+ year.toString()+'-'+ months[month - 1] +'-'+ issue.toString()+'.pdf'}/>
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( (publishedOn === "") ? "" : publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( (approvedOn === "") ? "" : approvedOn?.toDate()?.toLocaleDateString() || '' )} />
                                        </td>
                                        {/* <td>{title}</td>
                                        <td>{issue}</td>
                                        <td>{months[month - 1]}</td>
                                        <td>{year}</td>
                                        <td>{edition}</td> */}
                                    </tr>
                                )
                            })
                        }
                        <ToastContainer />
                    </tbody>
                </table>
                
            }
        </div>
    );
}

export default NewslettersTable;
                                