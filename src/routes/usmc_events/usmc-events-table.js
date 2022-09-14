import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import Cell from '../../components/cell';

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
                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={event => {
                                    const docRef = doc(db, 'calendarEvents', idData);
                                    const data = {
                                        title: title.current.value,
                                        summary: summary.current.value,
                                        datefrom: datefrom.current.value,
                                        timefrom: timefrom.current.value,
                                        dateto: dateto.current.value,
                                        timeto: timeto.current.value
                                    };
                                      updateDoc(docRef, data)
                                      .then(docRef => {
                                        alert("The Event has been successfully updated.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with updating this event, Please try again.\n\n"+error);
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
                                    const docRef = doc(db, 'calendarEvents', idData);
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        alert("The Event has been successfully deleted.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with deleting this event, Please try again.\n\n"+error);
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