import React from 'react';
import Cell from '../../components/cell';
import Linkify from 'linkify-react';

function NewsTable(props) {
    const { faqs, searchQuery } = props;
   
    return (
        <div className='table-container'>
            <h4 className={`text-start${faqs.length !== 0 ? ' mb-4' : ' mb-0'}`}>FAQs ({faqs.length})</h4>
            {
                faqs.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Body</th>
                            <th>Video</th>
                            <th>Author</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            faqs.map(item => {
                                const {
                                    subject,
                                    body,
                                    video,
                                    author,
                                    date
                                } = item.data();

                                function editFaq(event) {
                                    console.log(event);
                                }

                                /** 
                                 * {@ https://stackoverflow.com/a/17913752} 
                                 */
                                function formatTimeHHMMA(d) {
                                    function z(n){return (n<10?'0':'')+n}
                                    var h = d.getHours();
                                    return (h%12 || 12) + ':' + z(d.getMinutes()) + ' ' + (h<12? 'AM' :'PM');
                                }

                                // const options = { defaultProtocol: 'https' };
                                const options = {target: '_blank'};

                                return(
                                    <tr onClick={editFaq} key={item.id}>
                                        <td className='word-break'>
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
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={author} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={date.toDate().toLocaleDateString() + ' ' + formatTimeHHMMA(date.toDate())} />
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