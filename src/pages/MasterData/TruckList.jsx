import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TruckList = () => {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    axios.get('${process.env.REACT_APP_API_URL}/api/trucks')
      .then(response => setTrucks(response.data))
      .catch(error => console.error("Gagal mengambil data trucks:", error));
  }, []);

  return (
    <div>
      <h2>Daftar Truck</h2>
      <table border="1" cellPadding="10" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Jenis</th>
            <th>Driver</th>
            <th>Status</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {trucks.map(truck => (
            <tr key={truck.truckId}>
              <td>{truck.truckId}</td>
              <td>{truck.truckType}</td>
              <td>{truck.driver}</td>
              <td>{truck.status}</td>
              <td>{truck.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TruckList;
