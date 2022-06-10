import Cell from '../../components/cell';
import React from 'react';

function UPKUSMCTable(props) {
    const { posts, searchQuery } = props;




    return (
        <div className='table-container'>
            <h4 className={`text-start${posts.length !== 0 ? ' mb-4' : ' mb-0'}`}>Events ({posts.length})</h4>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th width='10%'>Module Name</th>
                            <th width='35%'>Description</th>
                            <th width='15%'>Module ID</th>
                            <th width='15%'>Tags</th>
                            <th width='5%'>Published</th>
                            <th width='5%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
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
                                            <Cell words={[searchQuery]} text={module} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={description} />
                                        </td>
                                        {/* <td className='word-break' dangerouslySetInnerHTML={{__html: videoLink}} /> */}
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={docID} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={tags} />
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

export default UPKUSMCTable;