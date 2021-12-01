
// Used Bootstrap and MD Bootstrap for the interface
import './App.css';
import {  useState } from 'react';
import { MDBInput, MDBCol } from "mdbreact";

// Made Drop Down Menu Default as ID
const App = () => {
  const [searchString, setSearchString] = useState('')
  const [searchType, setSearchType] = useState('id')
  const [propertyData, setPropertyData] = useState([]);
 
//  Search Bar input Target Value
  const handleChange = event => {
    const inputValue = event.target.value
    setSearchString(inputValue)
  }
  
  // Drop Down Menu Selection Target
  const handleSelectChange = event => {
    const value = event.target.value
    setSearchType(value)
  }

  const handleSubmit = e => {
    e.preventDefault()

    // Fecthing API From The URL You Provided, but searching for data with the specific searchType selected (Drop down menu)
    //  and the specific input value (searchString) inserted. Also had to merge lrProperty and lrTransaction database tables in order to get 
    // both/all the information needed for the results page.
    fetch(`http://localhost:3000/search?${searchType}=${searchString}`)
      .then(res => res.json())
      .then(res => {
        if(searchType === 'id') {
          setPropertyData(res.lrProperty.lrTransactions.map(t => addMetaData(res.lrProperty, t)))
        } else {
          const transactions = res.lrProperties.map(p => p.lrTransactions.map(t => addMetaData(p, t))).flat()
          setPropertyData(transactions)
        }
      })
      // Error Logging
      .catch(err => console.log(err))
  }

  const addMetaData = (property, transaction) => {
    return { 
      ...transaction,
      outcode: property.outcode,
      paon: property.paon,
      saon: property.saon,
      street: property.street
    } 
  }

  // Property Data
  const renderElements = () => {
    return propertyData?.map((el, i) => {
      return <tr key={i}>
        <td>{el.id}</td>
        <td>{el.saon}</td>
        <td>{el.street}</td>
        <td>{el.paon}</td>
        <td>{el.outcode}</td>
        <td>{el.date}</td>
        <td>£{el.price}</td>
      </tr>
    })
  }

  // Search Box
  return <div className='container'>
    <div className="App">
      <header className="App-header">
        <form className="searchBox" onSubmit={handleSubmit}>
          <div className="form-group">
            {/* Drop Down Menu Selection */}
              <select className="form-control" onChange={handleSelectChange} defaultValue={searchType}>
                <option value='id'>id</option>
                <option value='postcode'>postcode</option>
                <option value='street'>street</option>
              </select>
          </div>
          {/* Search Bar */}
        <MDBCol md="6">
          <MDBInput hint="Search" onChange={handleChange} type="text" containerClass="mt-0" />
        </MDBCol>
        {/* Search Button */}
          <button type="submit" size="lg" className="btn">SEARCH</button>
        </form>
      </header>
  </div>

    {/* No Data Will Hide Table Headings */}
    <div className={!propertyData.length ? 'd-none' : 'd-block'}>
      <table border='1' className="table table-striped">
        <thead> 
          <tr>
            <th scope="col"><td>Id</td></th>
            <td>Apt</td>
            <td>Street</td>
            <td>Building</td>
            <td>Postcode</td>
            <td>Date</td>
            <td>Price</td>
          </tr>
        </thead>
        {/* Results In Table */}
        <tbody>{ renderElements() }</tbody>
      </table>
    </div>
  </div>
}

export default App;
