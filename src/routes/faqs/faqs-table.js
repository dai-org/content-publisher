import React, { useRef, useState } from 'react';
import Modali, { useModali } from 'modali';
import Cell from '../../components/cell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'


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

    return (
        <div className='table-container'>
            {
                faqs.length !== 0 &&
                <table className='w-100'>

<Modali.Modal {...exampleModal}>
                   { AppUser?.roles?.includes('Approver') ?
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

                            
                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={event => {
                                    const docRef = doc(db, 'faq', idData);
                                    const data = {
                                        group: group.current.value,
                                        question: question.current.value,
                                        answer: answer.current.value
                                    };
                                      updateDoc(docRef, data)
                                      .then(docRef => {
                                        alert("The FAQ term has been successfully updated.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with updating the FAQ, Please try again.\n\n"+error);
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
                                    const docRef = doc(db, 'faq', idData);
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        alert("The FAQ term has been successfully deleted.\n\nThis page will now refresh once you click OK.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with deleting the FAQ, Please try again.\n\n"+error);
                                      })
                                }}
                            >
                                Delete
                            </button>
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
                                    approvedOn
                                } = item.data();

                                function openEdit() {
                                    if (AppUser?.roles?.includes('Approver')){
                                     setIDData(id)
                                     setEditData(item.data())
                                     toggleExampleModal() 
                                 }
                                 }
                                 
                                return(
                                    <tr onClick={openEdit} key={id}>
                                        <td>
                                        { AppUser?.roles?.includes('Approver') ?
                                        <FontAwesomeIcon color="red" icon={faEdit}/> : ""
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