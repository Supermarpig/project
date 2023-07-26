import { useState } from 'react'
import './App.css'
// import fetchAPI from '/src/utils/fetchAPI'

function App() {
  const [count, setCount] = useState(0)

  // interface dataType {
  //   // 定義 data 的型別
  //   id: number;
  //   name: string;
  // }

  // fetchAPI({ url: 'https://tiny-server.zeabur.app/api/getdata' })
  //   .then((data: dataType) => {
  //     console.log(data);
  //   })
  //   .catch((error: dataType) => {
  //     console.log('Error:', error);
  //   });

  return (
    <>
      <div className='container'>
        <button>A</button>
        <div>{count}</div>
        <button>B</button>
        <div>{count}</div>
      </div>

    </>
  )
}

export default App
