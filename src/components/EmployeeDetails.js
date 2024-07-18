import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AppContext } from '../context/AppContext';
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { divIcon, Icon, point } from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmployeeDetails = () => {
  const [searchParams] = useSearchParams();
  const company = searchParams.get('company');
  const index = parseInt(searchParams.get('index'), 10);
  const { employees, setAllEmployees, favorites } = useContext(AppContext);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        let fetchedEmployees = employees;
        if (company !== 'favorites') {
          if (employees.length === 0) {
            const response = await axios.get(`https://randomuser.me/api/?results=50&seed=${company}`);
            fetchedEmployees = response.data.results;
            setAllEmployees(fetchedEmployees);
          }
          setEmployee(fetchedEmployees[index]);
        } else {
          setEmployee(favorites[index]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data. Please check your network connection.');
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [company, index, employees, setAllEmployees, favorites]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4">{error}</div>;
  if (!employee) return <div className="container mt-4">Employee not found.</div>;

  const customIcon = new Icon({
    iconUrl: require("../icons/placeholder.png"),
    iconSize: [38, 38]
  });

  const createClusterCustomIcon = (cluster) => {
    return new divIcon({
      html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: point(33, 33, true)
    });
  };

  const employeeCoordinates = [
    parseFloat(employee.location.coordinates.latitude),
    parseFloat(employee.location.coordinates.longitude)
  ];

  const FitBoundsToMarker = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
      map.fitBounds([coordinates]);
    }, [map, coordinates]);
    return null;
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="row g-0">
          <div className="col-md-4 text-center p-4">
            <img src={employee.picture.large} alt={employee.name.first} className="img-fluid rounded-circle" />
            <h2 className="card-title mt-3">{employee.name.first} {employee.name.last}</h2>
            <p className="card-text"><strong>Age:</strong> {employee.dob.age}</p>
            <p className="card-text"><strong>Email:</strong> {employee.email}</p>
            <p className="card-text"><strong>Phone:</strong> {employee.phone}</p>
            <p className="card-text"><strong>Location:</strong> {employee.location.city}, {employee.location.country}</p>
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <MapContainer
                center={employeeCoordinates}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "400px", width: "100%" }}
                className="mt-3"
              >
                <FitBoundsToMarker coordinates={employeeCoordinates} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MarkerClusterGroup
                  chunkedLoading
                  iconCreateFunction={createClusterCustomIcon}
                >
                  <Marker position={employeeCoordinates} icon={customIcon}>
                    <Popup>
                      <strong>{employee.name.first} {employee.name.last}</strong><br />
                      {employee.location.city}, {employee.location.country}
                    </Popup>
                  </Marker>
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary mt-3">Back</button>
    </div>
  );
};

export default EmployeeDetails;