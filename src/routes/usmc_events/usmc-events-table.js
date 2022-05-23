import React from 'react';
import Cell from '../../components/cell';
import Linkify from 'linkify-react';

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
                            <th width='15%'>Event</th>
                            <th width='45%'>Description</th>
                            <th width='10%'>Date</th>
                            <th width='10%'>Time From</th>
                            <th width='10%'>Time To</th>
                            <th width='10%'>Approval</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
                                const {
                                    subject,
                                    description,
                                    date,
                                    timefrom,
                                    timeto,
                                    approved,
                                    approvedBy,
                                    approvedOn
                                } = item.data();

                                function editFaq(event) {
                                    console.log(event);
                                }

                                function formatTimeHHMMA(d) {
                                    if (!d) {
                                        return '';
                                    }

                                    function z(n){return (n<10?'0':'')+n}
                                    var h = d.getHours();
                                    return (h%12 || 12) + ':' + z(d.getMinutes()) + ' ' + (h<12? 'AM' :'PM');
                                }

                                return(
                                    <tr onClick={editFaq} key={item.id}>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={subject} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={description} />
                                        </td>
                                        {/* <td className='word-break' dangerouslySetInnerHTML={{__html: videoLink}} /> */}
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={date} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={timefrom} />
                                        </td>
                                        <td className=''>
                                        <Cell words={[searchQuery]} text={timeto} />
                                        </td>
                                        <td className=''>
                                        <Cell words={[searchQuery]} text={approved +' by '+  approvedBy + ' on '+ approvedOn?.toDate()?.toLocaleDateString() + ' ' + formatTimeHHMMA(approvedOn?.toDate())}/>
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