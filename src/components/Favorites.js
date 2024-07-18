import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { favorites, removeFavorite } = useContext(AppContext);

  if (favorites.length === 0) {
    return <div className="container mt-4">No favorite employees.</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Favorite Employees</h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {favorites.map((employee, index) => (
          <div key={employee.login.uuid} className="col">
            <div className="card h-100 shadow-sm border-0 hover-zoom">
              <img src={employee.picture.large} alt={employee.name.first} className="card-img-top p-2 mx-auto mt-3" style={{ width: '150px', height: '150px' }} />
              <div className="card-body text-center">
                <h5 className="card-title">{employee.name.first} {employee.name.last}</h5>
                <p className="card-text">Age: {employee.dob.age}</p>
                <p className="card-text">Location: {employee.location.city}, {employee.location.country}</p>
                <div className="btn-group mt-3" role="group">
                  <button onClick={() => removeFavorite(employee)} className="btn btn-outline-danger">
                    Remove Favorite
                  </button>
                  <Link to={`/employee/?company=favorites&index=${index}`} className="btn btn-outline-secondary">
                    More Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;