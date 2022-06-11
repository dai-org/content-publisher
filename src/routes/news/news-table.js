import React from 'react';
import Cell from '../../components/cell';
import Linkify from 'linkify-react';

function NewsTable(props) {
    const { posts, searchQuery } = props;
   
    return (
        <div className='table-container'>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Body</th>
                            <th>Video URL</th>
                            <th>MarAdmin ID</th>
                            <th>Author</th>
                            <th>Post Type</th>
                            <th>Published</th>
                            <th>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
                                const {
                                    subject,
                                    body,
                                    video,
                                    author,
                                    maradminid,
                                    publishedOn,
                                    approvedOn,
                                    publishedBy,
                                    approvedBy,
                                    type
                                } = item.data();

                                function editFaq(event) {
                                    console.log(event);
                                }


                                // const options = { defaultProtocol: 'https' };
                                const options = {target: '_blank'};

                                return(
                                    <tr onClick={editFaq} key={item.id}>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={subject} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={body} />
                                        </td>
                                        {/* <td className='word-break' dangerouslySetInnerHTML={{__html: videoLink}} /> */}
                                        <td>
                                            <Linkify tagName="span" options={options}>
                                                {video}
                                            </Linkify>
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={maradminid} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={author} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={type} />
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