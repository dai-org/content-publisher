import React from 'react';
import Cell from '../../components/cell';

function USMCEventsTable(props) {
    const { posts, searchQuery } = props;
   
    return (
        <div className='table-container'>
            <h4 className={`text-start${posts.length !== 0 ? ' mb-4' : ' mb-0'}`}>Events ({posts.length})</h4>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th width='15%'>Event Title</th>
                            <th width='45%'>Description</th>
                            <th width='10%'>Date & Time From</th>
                            <th width='10%'>Date & Time To</th>
                            <th width='10%'>Approval</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
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

                                function editFaq(event) {
                                    console.log(event);
                                }


                                return(
                                    <tr onClick={editFaq} key={item.id}>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={title} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={summary} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={datefrom +' - '+ timefrom} />
                                        </td>
                                        <td className=''>
                                        <Cell words={[searchQuery]} text={dateto +' - '+ timeto} />
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

export default USMCEventsTable;