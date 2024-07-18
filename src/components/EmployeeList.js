import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeeList = () => {
  const { favorites, addFavorite, employees, allEmployees, setEmployees, setAllEmployees, setSearchTerm, searchTerm } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);
  const [filterGroup, setFilterGroup] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (searchValue) => {
      const result = await axios(`https://randomuser.me/api/?results=50&seed=${searchValue}`);
      setEmployees(result.data.results);
      setAllEmployees(result.data.results);
    };

    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
      fetchData(search);
    } else {
      fetchData('default'); // Fetch all employees or a default set
    }
  }, [location.search, setEmployees, setAllEmployees, setSearchTerm]);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const filterEmployees = (searchValue, group, gender) => {
    let filteredEmployees = allEmployees;

    if (group !== 'all') {
      filteredEmployees = filteredEmployees.filter(employee => {
        if (group === 'manager') {
          return employee.dob.age >= 40;
        } else if (group === 'worker') {
          return employee.dob.age >= 25 && employee.dob.age < 40;
        } else if (group === 'junior') {
          return employee.dob.age < 25;
        }
        return true;
      });
    }

    if (gender !== 'all') {
      filteredEmployees = filteredEmployees.filter(employee => employee.gender === gender);
    }

    setEmployees(filteredEmployees);
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    debounce(() => {
      if (value) {
        navigate(`/?search=${value}`);
        filterEmployees(value, filterGroup, genderFilter);
      } else {
        navigate(`/`);
        setEmployees(allEmployees); // Reset to all employees if search is cleared
      }
    }, 300)();
    setCurrentPage(1);
  };

  const handleGroupChange = (group) => {
    setFilterGroup(group);
    filterEmployees(searchTerm, group, genderFilter);
  };

  const handleGenderChange = (gender) => {
    setGenderFilter(gender);
    filterEmployees(searchTerm, filterGroup, gender);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="d-flex gap-3 flex-wrap mb-4">
        <div className="flex-grow-1">
          <label htmlFor="groupFilter" className="form-label">Filter by Group</label>
          <select id="groupFilter" className="form-select" aria-label="Filter by group" onChange={(event) => handleGroupChange(event.target.value)}>
            <option value="manager" selected={filterGroup === 'manager'}>Manager</option>
            <option value="worker" selected={filterGroup === 'worker'}>Workers</option>
            <option value="junior" selected={filterGroup === 'junior'}>Juniors</option>
            <option value="all" selected={filterGroup === 'all'}>All</option>
          </select>
        </div>
        <div className="flex-grow-1">
          <label htmlFor="employeeSearch" className="form-label">Search Employees</label>
          <input
            id="employeeSearch"
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-control"
          />
        </div>
        <div className="flex-grow-1">
          <label htmlFor="genderFilter" className="form-label">Filter by Gender</label>
          <select id="genderFilter" className="form-select" aria-label="Filter by gender" onChange={(event) => handleGenderChange(event.target.value)}>
            <option value="male" selected={genderFilter === 'male'}>Male</option>
            <option value="female" selected={genderFilter === 'female'}>Female</option>
            <option value="all" selected={genderFilter === 'all'}>All</option>
          </select>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-4">
        {currentEmployees.map((employee, index) => (
          <div key={employee.login.uuid} className="col">
            <div className="card h-100 shadow-sm border-0 hover-zoom">
              <img src={employee.picture.large} alt={employee.name.first} className="card-img-top p-2 mx-auto mt-3" />
              <div className="card-body">
                <h5 className="card-title">{employee.name.first} {employee.name.last}</h5>
                <p className="card-text">Age: {employee.dob.age}</p>
                <p className="card-text">Location: {employee.location.city}, {employee.location.country}</p>
                <div className="btn-group mt-3" role="group">
                  <button
                    onClick={() => addFavorite(employee)}
                    className={`btn ${favorites.find(fav => fav.login.uuid === employee.login.uuid) ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                  >
                    {favorites.find(fav => fav.login.uuid === employee.login.uuid) ? 'Favorited' : 'Save as Favorite'}
                  </button>
                  <Link to={`/employee/?company=${searchTerm}&index=${indexOfFirstEmployee + index}`} className="btn btn-outline-secondary">
                    More Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <nav aria-label="Page navigation" className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          {Array.from({ length: Math.ceil(employees.length / employeesPerPage) }, (_, index) => (
            <li key={index + 1} className="page-item">
              <button onClick={() => paginate(index + 1)} className="page-link">
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default EmployeeList;