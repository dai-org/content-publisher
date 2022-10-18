import React, { useRef, useState } from 'react';
import Modali, { useModali } from 'modali';
import Cell from '../../components/cell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FaqsTable(props) {
    const { faqs, searchQuery, AppUser } = props;
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit FAQs Entry"
      });
      const uploadButton = useRef();
      const db = getFirestore(); // initialize Firestore
      const group = useRef();
      const question = useRef();
      const answer = useRef();
      const notes = useRef();
      const status = useRef();

    return (
        <div className='table-container'>
            {
                faqs.length !== 0 &&
                <table className='w-100'>

<Modali.Modal {...exampleModal}>
{ AppUser?.roles?.includes('Approver') || AppUser?.roles?.includes('Publisher')  ?
                    <div className='cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center'>
                        <div>
                        <div className='input-group mb-3'>
                                <label className='input-group-text' htmlFor='group'>Group </label>
                                <select className='form-select' value={editData.group} id='group' ref={group} >
                                    <option value='CA'>CA</option>
                                    <option value='B2R'>B2R</option>
                                    <option value='DAI-101'>DAI-101</option>
                                    <option value='OTL'>OTL</option>
                                    <option value='P2P'>P2P</option>
                                    <option value='OBIEE'>OBIEE</option>
                                </select>
                            </div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'>Question</span>
                                <textarea className="form-control" rows="2" defaultValue={editData.question} ref={question}></textarea>
                            </div>
                            <div className='input-group mb-3'>
                                <span className='input-group-text'>Answer</span>
                                <textarea className="form-control" rows="6" defaultValue={editData.answer} ref={answer}></textarea>
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
                                onClick={async (event) => {
                                    const docRef = doc(db, 'faq', idData);
                                    const data = {
                                        group: group.current.value,
                                        question: question.current.value,
                                        answer: answer.current.value,
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
                                    const docRef = doc(db, 'faq', idData);
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
                            <th width='25%'>Question</th>
                            <th width='30%'>Answer</th>
                            <th width='10%'>Group</th>
                            <th width='15%'>Published</th>
                            <th width='15%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            faqs.map(item => {
                                const { id } = item;
                                const {
                                    question,
                                    answer,
                                    group,
                                    publishedBy,
                                    publishedOn,
                                    approvedBy,
                                    approvedOn,
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
                                        <td>
                                            <Cell words={[searchQuery]} text={question} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={answer} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={group} />
                                        </td>

                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( (publishedOn === "") ? "" : publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( (approvedOn === "") ? "" : approvedOn?.toDate()?.toLocaleDateString() || '' )} />
                                        </td>
                                        {/* <td>{question}</td>
                                        <td>{answer}</td>
                                        <td>{group}</td> */}
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

export default FaqsTable;