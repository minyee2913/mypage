import { useEffect, useState } from 'react';
import './style.css';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Repository } from './repository';
import { Link } from 'react-router-dom';

import xw from './x$wZxZ.json'

const id = 'minyee2913';

function Repos() {
    const [ListItem, SetListItem] = useState<JSX.Element[]>([]);
    useEffect(()=>{
        fetch(`https://api.github.com/users/${id}/repos`, {
            headers: {
                Authorization: xw.front + xw.back,
            }
        })
        .then(response => response.json())
        .then((data: Repository[]) => {
            if (!Array.isArray(data)) {
                return
            }

            const items = data.map(
                (itm) => <a href={itm.html_url} id='listlink'><div key={itm.id} className='listItem pointer'>
                    <span id='name'>{itm.name}</span><span id='fork'>{itm.fork ? ' [fork]' : ''}</span><span id='lang'>{itm.language}</span>
                    <br></br><span id='descrip'>{itm.description}</span>
                </div></a>
            )

            SetListItem(items);
        })
    }, [])

    return (
        <>
            <div id='list'>
            <div style={
                    {
                        height: 40
                    }
                }></div>
                {ListItem}
                <div style={
                    {
                        height: 50
                    }
                }></div>
            </div>
            <Link to='/'><div id='exit' className='pointer'>
                <ExitToAppIcon sx={{ fontSize: 55 }}></ExitToAppIcon>
            </div></Link>
        </>
    )
}

export default Repos;