// import { useState } from 'react'
import './App.css'
// import fetchAPI from '/src/utils/fetchAPI'
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { increment, decrement } from './store/reducers';

function App() {
  // const [count, setCount] = useState(0)

  const counter = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(increment());
  }

  const handleDecrement = () => {
    dispatch(decrement());
  }

  return (
    <>
      <div className='container'>
        <div className='block'>
          <h1>Counter: {counter}</h1>
          <button onClick={handleIncrement}>Increment</button>
          <button onClick={handleDecrement}>Decrement</button>
        </div>
        {/* <div className='block'>
          <h1></h1>
        </div> */}
      </div>

    </>
  )
}

export default App
