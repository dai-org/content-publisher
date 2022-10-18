import React, { useRef, useState } from 'react';
import Cell from '../../components/cell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NewsTable(props) {
    const { posts, searchQuery, AppUser } = props;
    const uploadButton = useRef();
    const db = getFirestore();
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit News/Post Entry"
      });
      const subject = useRef();
      const maradminid = useRef();
      const body = useRef();
      const video = useRef();
      const notes = useRef();
      const status = useRef();

    return (
        <div className='table-container'>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    <Modali.Modal {...exampleModal}>
                    { AppUser?.roles?.includes('Approver') || AppUser?.roles?.includes('Publisher')  ?
                    <div className='cp-form-inner mb-5 mt-5 col-14 px-md-5 justify-content-center'>
                        <div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Subject</span>
                            <textarea className="form-control" rows="1" defaultValue={editData.subject} ref={subject}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Body</span>
                            <textarea className="form-control" rows="6" defaultValue={editData.body} ref={body}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Video/MarAdmin URL</span>
                            <textarea placeholder="http://www.website.com (Leave Blank, if there is no URL)" defaultValue={editData.video} className="form-control" rows="1" ref={video}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>MarAdmin ID</span>
                            <textarea placeholder="245/34 (Leave Blank, if not MarAdmin)" defaultValue={editData.maradminid} className="form-control" rows="1" ref={maradminid}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                                    <span className='input-group-text'>Notes</span>
                                    <textarea className="form-control" rows="6" defaultValue={editData.notes} ref={notes}></textarea>
                                </div>
                                { editData.status !== "Approved" ?
                                <div className='input-group mb-2'>
                                <label className='input-group-text' htmlFor='group'>Published Status</label>
                                        <select className='form-select' id='group' ref={status} >
                                        <option value='Awaiting Approval'>Submit for approval</option>
                                        </select> 
                            </div>
                                    : ""}
                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={event => {
                                    const docRef = doc(db, 'posts', idData);
                                    const data = {
                                        subject: subject.current.value,
                                        body: body.current.value,
                                        video: video.current.value,
                                        maradminid: maradminid.current.value,
                                        postType: "Info",
                                        notes: notes.current.value,
                                        status: (editData.notes !== "Approved") ? status.current.value : "Approved"


                                    };
                                      updateDoc(docRef, data)
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
                                    const docRef = doc(db, 'posts', idData);
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
                                            });
                                                                              })
                                }}
                            >
                                Delete
                            </button>
                            <ToastContainer />
                        </div>
                    </div>
                    :
                    
<div class="alert">
  <h4 class="alert-heading">Access Denied!</h4>
  <p>Current user does not have access to edit data.</p>
</div>
}
                                        </Modali.Modal>  
                    <thead>
                        <tr>
                        <th width='5%'></th>
                            <th width='25%'>Subject</th>
                            <th width='40%'>Body / Video URL / MarAdmin ID</th>
                            <th width='15%'>Published</th>
                            <th width='15%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
                                const { id } = item;
                                const {
                                    subject,
                                    body,
                                    video,
                                    maradminid,
                                    publishedOn,
                                    approvedOn,
                                    publishedBy,
                                    approvedBy,
                                    status
                                } = item.data();


                                function openEdit() {
                                   if (AppUser?.roles?.includes('Publisher') || AppUser?.roles?.includes('Approver')){
                                    setIDData(id)
                                    setEditData(item.data())
                                    toggleExampleModal() 
                                }
                                }

                                return(
                                    <tr key={id} bgcolor={status !== "Approved" ? "#ffffe0" : ""}>
                                       <td>
                                       { AppUser?.roles?.includes('Publisher') || AppUser?.roles?.includes('Approver') ?
                                        <FontAwesomeIcon onClick={openEdit} color="red" style={{marginRight: 10}} icon={faEdit}/> : ""
                                        }
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={subject} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={body +' | URL: '+ video +' | Maradmin ID: '+ maradminid}/>
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( approvedOn?.toDate()?.toLocaleDateString() || '' )} />
                                        </td>

                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}

export default NewsTable;