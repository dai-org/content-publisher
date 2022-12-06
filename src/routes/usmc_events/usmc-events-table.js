import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import Cell from '../../components/cell';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function USMCEventsTable(props) {
    const { posts, searchQuery, AppUser } = props;
    const uploadButton = useRef();
    const db = getFirestore();
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit Event Entry"
      });
      const title = useRef();
      const summary = useRef();
      const timefrom = useRef();
      const timeto = useRef();
      const datefrom = useRef();
      const dateto = useRef();
      const notes = useRef();
      const status = useRef();
    return (
        <div className='table-container'>
            <h4 className={`text-start${posts.length !== 0 ? ' mb-4' : ' mb-0'}`}>Events ({posts.length})</h4>
            {
                posts.length !== 0 &&
                <table className='w-100'>

<Modali.Modal {...exampleModal}>
{ AppUser?.roles?.includes('Approver') || AppUser?.roles?.includes('Publisher')  ?
                    <div className='cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center'>
                        <div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Title</span>
                            <textarea placeholder="" className="form-control" rows="1" defaultValue={editData.title} ref={title}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Description</span>
                            <textarea placeholder="" className="form-control" rows="1" defaultValue={editData.summary} ref={summary}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Date From</span>
                            <input type="date" value={editData.datefrom} className="form-control" ref={datefrom}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Time From</span>
                            <input type="time" value={editData.timefrom} className="form-control" ref={timefrom}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Date To</span>
                            <input type="date" value={editData.dateto} className="form-control" ref={dateto}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Time To</span>
                            <input type="time" value={editData.timeto} className="form-control" ref={timeto}></input>
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
                                onClick={async event => {
                                    const docRef = doc(db, 'calendarEvents', idData);
                                    const data = {
                                        title: title.current.value,
                                        summary: summary.current.value,
                                        datefrom: datefrom.current.value,
                                        timefrom: timefrom.current.value,
                                        dateto: dateto.current.value,
                                        timeto: timeto.current.value,
                                        notes: notes.current.value,
                                        status: (editData.status !== "Approved") ? status.current.value : "Approved"

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
                                    const docRef = doc(db, 'calendarEvents', idData);
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
                            <th width='5%'></th>
                            <th width='25%'>Event Title</th>
                            <th width='30%'>Description</th>
                            <th width='20%'>Date & Time </th>
                            <th width='10%'>Publisher</th>
                            <th width='10%'>Approver</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
                                const { id } = item;

                                const {
                                    title,
                                    summary,
                                    datefrom,
                                    dateto,
                                    timefrom,
                                    timeto,
                                    publishedBy,
                                    approvedBy,
                                    publishedOn,
                                    approvedOn,
                                    status
                                } = item.data();

                                function openEdit() {
                                    if (AppUser?.roles?.includes('Publisher')){
                                        setIDData(id)
                                     setEditData(item.data())
                                     toggleExampleModal() 
                                 }
                                 }


                                return(
                                    <tr key={id} bgcolor={status !== "Approved" ? "#ffffe0" : ""}>
                                        <td>
                                        { AppUser?.roles?.includes('Publisher') ?
                                        <FontAwesomeIcon onClick={openEdit} color="red" style={{marginRight: 10}} icon={faEdit}/> : ""
                                        }
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={title} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={summary} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={datefrom +' '+ timefrom +' - '+ dateto +' '+ timeto} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( (publishedOn === "") ? "" : publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( (approvedOn === "") ? "" : approvedOn?.toDate()?.toLocaleDateString() || '' )} />
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

export default USMCEventsTable;