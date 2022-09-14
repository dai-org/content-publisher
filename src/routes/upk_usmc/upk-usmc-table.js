import Cell from '../../components/cell';
import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'

function UPKUSMCTable(props) {
    const { posts, searchQuery, AppUser } = props;
    const uploadButton = useRef();
    const db = getFirestore();
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit UPK/SPD Entry"
      });
      const module = useRef();
      const description = useRef();
      const docID = useRef();
      const tags = useRef();


    return (
        <div className='table-container'>
            <h4 className={`text-start${posts.length !== 0 ? ' mb-4' : ' mb-0'}`}>Events ({posts.length})</h4>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    
                <Modali.Modal {...exampleModal}>
                { AppUser?.roles?.includes('Approver') ?
                    <div className='cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center'>
                        <div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Module UID</span>
                            <textarea placeholder="" className="form-control" defaultValue={editData.docID} rows="1" ref={docID}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>Description</span>
                            <textarea placeholder="" className="form-control" defaultValue={editData.description} rows="1" ref={description}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>UPK/SPD Title</span>
                            <textarea placeholder="" className="form-control" defaultValue={editData.module} rows="1" ref={module}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>TAGs</span>
                            <textarea placeholder="" className="form-control" defaultValue={editData.tags} rows="1" ref={tags}></textarea>
                        </div>

                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={event => {
                                    const docRef = doc(db, 'upktraining', idData);
                                    const data = {
                                        docID: docID.current.value,
                                        description: description.current.value,
                                        module: module.current.value,
                                        tags: tags.current.value
                                    };
                                      updateDoc(docRef, data)
                                      .then(docRef => {
                                        alert("UPK/SPD has been successfully updated.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with updating this UPK/SPD, Please try again.\n\n"+error);
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
                                    const docRef = doc(db, 'upktraining', idData);
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        alert("UPK/SPD has been successfully deleted.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with deleting the UPK/SPD, Please try again.\n\n"+error);
                                      })
                                }}
                            >
                                Delete
                            </button>
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
                            <th width='10%'>Module Name</th>
                            <th width='35%'>Description</th>
                            <th width='10%'>Module ID</th>
                            <th width='15%'>Tags</th>
                            <th width='5%'>Published</th>
                            <th width='5%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
                                const { id } = item;
                                const {
                                    module,
                                    description,
                                    docID,
                                    tags,
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
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={module} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={description} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={docID} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={tags} />
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

export default UPKUSMCTable;