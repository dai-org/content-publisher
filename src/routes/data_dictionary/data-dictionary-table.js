import React, { useRef, useState } from 'react';
import Cell from '../../components/cell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DataDictionaryTable(props) {
    const { entries, searchQuery, AppUser } = props;
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit Data Dictionary Entry"
      });
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const uploadButton = useRef();
    const term = useRef();
    const description = useRef();
    const db = getFirestore(); // initialize Firestore
    const notes = useRef();
    const status = useRef();


    return (
        <div className='table-container'>
            {
                entries.length !== 0 &&
                <table className='w-100'>  
                       
                <Modali.Modal {...exampleModal}>
                   { AppUser?.roles?.includes('Approver') || AppUser?.roles?.includes('Publisher')  ?
                    <div className='cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center'>
                        <div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'>Term</span>
                                <textarea className="form-control" rows="2" defaultValue={editData.term} ref={term}></textarea>
                            </div>
                            <div className='input-group mb-3'>
                                    <span className='input-group-text'>Description</span>
                                    <textarea className="form-control" rows="6" defaultValue={editData.description} ref={description}></textarea>
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

                                    const docRef = doc(getFirestore(), 'dataDictionary', idData);
                                    const data = {
                                        term: term.current.value,
                                        description: description.current.value,
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
                                Update
                            </button>

                            <button
                                type='button'
                                style={{marginLeft:5}}
                                className='btn btn-danger w-20 round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    const docRef = doc(db, 'dataDictionary', idData);
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
                        </div>
                    </div>
                    :
                    
<div class="alert">
  <h4 class="alert-heading">Access Denied!</h4>
  <p>Current user does not have access to edit entry data.</p>
</div>
}
                                        </Modali.Modal>   
                    <thead>
                        <tr>
                        <th width='5%'></th>
                            <th width='10%'>Term</th>
                            <th width='45%'>Description</th>
                            <th width='20%'>Published</th>
                            <th width='20%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            entries.map(item => {
                                const { id } = item;
                                const {
                                    term,
                                    description,
                                    publishedBy,
                                    publishedOn,
                                    approvedBy,
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
                                        <FontAwesomeIcon onClick={openEdit}  color="red" style={{marginRight: 10}} icon={faEdit}/> : ""
                                        }
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={term} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={description} />
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

export default DataDictionaryTable;